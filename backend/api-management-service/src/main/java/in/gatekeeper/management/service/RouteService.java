package in.gatekeeper.management.service;

import in.gatekeeper.management.annotations.Auditable;
import in.gatekeeper.management.dto.requestDto.PaginationRequest;
import in.gatekeeper.management.dto.requestDto.RouteRequest;
import in.gatekeeper.management.dto.requestDto.RouteStatusRequest;
import in.gatekeeper.management.dto.responseDto.PageResponse;
import in.gatekeeper.management.dto.responseDto.RouteListVersionResponse;
import in.gatekeeper.management.dto.responseDto.RouteResponse;
import in.gatekeeper.management.dto.responseDto.RouteVersionResponse;
import in.gatekeeper.management.entity.ApiRoute;
import in.gatekeeper.management.entity.Organization;
import in.gatekeeper.management.entity.RouteConfigurationVersion;
import in.gatekeeper.management.enums.ConfigurationChangeType;
import in.gatekeeper.management.enums.RouteChangeType;
import in.gatekeeper.management.enums.RouteStatus;
import in.gatekeeper.management.events.GatewayConfigurationEventService;
import in.gatekeeper.management.repository.ApiRouteRepository;
import in.gatekeeper.management.repository.RouteConfigurationVersionRepository;
import in.gatekeeper.management.validation.RouteRequestValidator;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.file.AccessDeniedException;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RouteService {

    private final ApiRouteRepository apiRouteRepository;
    private final RouteConfigurationVersionRepository versionRepository;
    private final TenantContext tenantContext;
    private final RouteRequestValidator routeRequestValidator;
    private final RouteConfigurationVersionService routeConfigurationVersionService;
    private final GatewayConfigurationEventService configurationEventService;

    @Transactional
    @Auditable(
            action = "CREATE_ROUTE",
            resourceType = "API_ROUTE",
            resourceId = "#result.id",
            details = "Route configuration version 1 created"
    )
    public RouteResponse create(RouteRequest request) {
        Organization organization = tenantContext.getOrganization();
        routeRequestValidator.validate(request);

        if (apiRouteRepository.existsNonDeletedRouteWithId(organization.getId(), request.routeId())){
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Route ID already exists for this organization");
        }

        routeRequestValidator.validateUniquePathPattern(request.pathPattern(), organization.getId());

        ApiRoute route = new ApiRoute();
        RouteRequest.mapToApiRoute(route, request);
        route.setOrganization(organization);
        route.setConfigurationVersion(1L);
        route.setStatus(RouteStatus.INACTIVE);

        ApiRoute saved = apiRouteRepository.saveAndFlush(route);

        routeConfigurationVersionService.saveSnapshot(saved, RouteChangeType.CREATED);

        return RouteResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<RouteResponse> getAllRoutes(PaginationRequest request) {
        Organization organization = tenantContext.getOrganization();
        Pageable pageable = request.toPageable();

        Page<ApiRoute> routes = apiRouteRepository.findByOrganizationAndSearch(
                organization,
                RouteStatus.DELETED,
                request.search(),
                pageable
        );

        return PageResponse.from(routes, RouteResponse::from);
    }

    @Transactional(readOnly = true)
    public RouteResponse getRoute(UUID id) throws AccessDeniedException {
        UUID organizationId = tenantContext.getOrganizationId();
        ApiRoute route = getOwnRoute(id, organizationId);

        return RouteResponse.from(route);
    }

    @Transactional
    @Auditable(
            action = "DELETE_ROUTE",
            resourceType = "API_ROUTE",
            resourceId = "#p0",
            details = "Route soft-deleted"
    )
    public void deleteRoute(UUID id) throws AccessDeniedException {
        UUID organizationId = tenantContext.getOrganizationId();
        ApiRoute route = getOwnRoute(id, organizationId);

        route.setStatus(RouteStatus.DELETED);
        route.setDeletedAt(Instant.now());
        route.setConfigurationVersion(route.getConfigurationVersion() + 1);

        routeConfigurationVersionService.saveSnapshot(route, RouteChangeType.DELETED);

        configurationEventService.publish(
                ConfigurationChangeType.ROUTE_DELETED,
                organizationId,
                route
        );

    }

    @Transactional(readOnly = true)
    public PageResponse<RouteResponse> getAllDeletedRoutes(@Valid PaginationRequest request) {
        Organization organization = tenantContext.getOrganization();
        Pageable pageable = request.toPageable();

        Page<ApiRoute> routes = apiRouteRepository.findByOrganizationAndStatus(
                organization,
                RouteStatus.DELETED,
                request.search(),
                pageable
        );

        return PageResponse.from(routes, RouteResponse::from);
    }

    @Transactional(readOnly = true)
    public PageResponse<RouteResponse> getAllActiveRoutes(@Valid PaginationRequest request) {
        Organization organization = tenantContext.getOrganization();
        Pageable pageable = request.toPageable();

        Page<ApiRoute> routes = apiRouteRepository.findByOrganizationAndStatus(
                organization,
                RouteStatus.ACTIVE,
                request.search(),
                pageable
        );

        return PageResponse.from(routes, RouteResponse::from);
    }

    @Transactional
    @Auditable(
            action = "UPDATE_ROUTE",
            resourceType = "API_ROUTE",
            resourceId = "#p0",
            details = "Route updated"
    )
    public RouteResponse updateRoute(UUID id, RouteRequest request) {
        Organization organization = tenantContext.getOrganization();
        ApiRoute route = getOwnRoute(id, organization.getId());

        if (!route.getRouteId().equals(request.routeId())){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "RouteId cannot be changed");
        }

        routeRequestValidator.validate(request);
        routeRequestValidator.validateUniquePathPattern(request.pathPattern(), organization.getId(), route.getId());

        RouteRequest.mapToApiRoute(route, request);

        route.setConfigurationVersion(route.getConfigurationVersion() + 1);
        routeConfigurationVersionService.saveSnapshot(route, RouteChangeType.UPDATED);

        configurationEventService.publish(
                ConfigurationChangeType.ROUTE_UPDATED,
                organization.getId(),
                route
        );

        return RouteResponse.from(route);
    }

    @Transactional
    @Auditable(
            action = "CHANGE_ROUTE_STATUS",
            resourceType = "API_ROUTE",
            resourceId = "#p0",
            details = "Route status changed"
    )
    public RouteResponse changeStatus(UUID id, RouteStatusRequest request) throws AccessDeniedException {
        UUID organizationId = tenantContext.getOrganizationId();
        ApiRoute route = getOwnRoute(id, organizationId);

        if (request.status() == RouteStatus.DELETED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Use the delete endpoint to delete a route");
        }

        if (route.getStatus() == request.status()) {
            return RouteResponse.from(route);
        }

        RouteChangeType changeType;
        ConfigurationChangeType eventChangeType;

        if (request.status() == RouteStatus.ACTIVE){
            changeType = RouteChangeType.ACTIVATED;
            eventChangeType = ConfigurationChangeType.ROUTE_ACTIVATED;
        }
        else{
            changeType = RouteChangeType.DEACTIVATED;
            eventChangeType = ConfigurationChangeType.ROUTE_DEACTIVATED;
        }

        route.setStatus(request.status());
        route.setConfigurationVersion(route.getConfigurationVersion() + 1);

        routeConfigurationVersionService.saveSnapshot(route, changeType);

        configurationEventService.publish(
                eventChangeType,
                organizationId,
                route
        );

        return RouteResponse.from(route);
    }

    @Transactional
    @Auditable(
            action = "RESTORE_ROUTE",
            resourceType = "API_ROUTE",
            resourceId = "#p0",
            details = "Route restore"
    )
    public RouteResponse restoreRoute(UUID id) {
        Organization organization = tenantContext.getOrganization();
        ApiRoute route = apiRouteRepository.findDeletedApiRoute(id, organization.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Deleted route not found"));

        if (apiRouteRepository.existsNonDeletedRouteWithId(organization.getId(), route.getRouteId())){
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot restore route because another route is already using this Route ID");
        }

        routeRequestValidator.validateUniquePathPattern(route.getPathPattern(), organization.getId());

        route.setStatus(RouteStatus.INACTIVE);
        route.setConfigurationVersion(route.getConfigurationVersion() + 1);
        route.setDeletedAt(null);

        routeConfigurationVersionService.saveSnapshot(route, RouteChangeType.RESTORED);

        return RouteResponse.from(route);
    }

    @Transactional(readOnly = true)
    public RouteListVersionResponse getVersions(UUID routeId, PaginationRequest request) throws AccessDeniedException {
        UUID organizationId = tenantContext.getOrganizationId();
        ApiRoute route = getOwnRoute(routeId, organizationId);

        Sort sort = Sort.by(Sort.Direction.DESC, "versionNumber");
        Pageable pageable = PageRequest.of(request.page(), request.limit(), sort);

        Page<RouteConfigurationVersion> versionPages = versionRepository.findByRouteAndSearch(route, request.search(), pageable);

        PageResponse<RouteVersionResponse> versions =  PageResponse.from(versionPages, v -> {
            RouteResponse versionSnapshot = routeConfigurationVersionService.deserializeConfiguration(
                    v.getConfigurationSnapshot()
            );

            return RouteVersionResponse.from(v, versionSnapshot);
        });

        return RouteListVersionResponse.builder()
                .routeId(route.getRouteId())
                .versions(versions)
                .build();
    }

    @Transactional
    @Auditable(
            action = "RESTORE_ROUTE_VERSION",
            resourceType = "API_ROUTE",
            resourceId = "#result.id",
            details = "Route restored to a previous version snapshot"
    )
    public RouteResponse restoreVersion(UUID versionId) throws AccessDeniedException {
        UUID organizationId = tenantContext.getOrganizationId();

        ApiRoute route = routeConfigurationVersionService.restoreSnapshot(versionId, organizationId);
        route.setStatus(RouteStatus.ACTIVE);
        route.setConfigurationVersion(route.getConfigurationVersion() + 1);

        ApiRoute saved = apiRouteRepository.saveAndFlush(route);

        routeConfigurationVersionService.saveSnapshot(saved, RouteChangeType.RESTORED);

        configurationEventService.publish(
                ConfigurationChangeType.ROUTE_VERSION_RESTORED,
                organizationId,
                route
        );

        return RouteResponse.from(saved);
    }

    private ApiRoute getOwnRoute(UUID id, UUID organizationId) {
        return apiRouteRepository.findApiRoute(id, organizationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Route Not Found"));
    }
}
