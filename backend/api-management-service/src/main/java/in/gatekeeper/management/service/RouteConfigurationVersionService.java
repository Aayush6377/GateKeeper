package in.gatekeeper.management.service;

import in.gatekeeper.management.dto.responseDto.RouteResponse;
import in.gatekeeper.management.entity.ApiRoute;
import in.gatekeeper.management.entity.RouteConfigurationVersion;
import in.gatekeeper.management.entity.RouteHeaderRule;
import in.gatekeeper.management.enums.RouteChangeType;
import in.gatekeeper.management.enums.RouteStatus;
import in.gatekeeper.management.repository.RouteConfigurationVersionRepository;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

import java.nio.file.AccessDeniedException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RouteConfigurationVersionService {

    private final RouteConfigurationVersionRepository versionRepository;
    private final ObjectMapper objectMapper;

    public void saveSnapshot(ApiRoute route, RouteChangeType changeType){
        RouteConfigurationVersion configurationVersion = new RouteConfigurationVersion();

        configurationVersion.setRoute(route);
        configurationVersion.setVersionNumber(route.getConfigurationVersion());
        configurationVersion.setChangeType(changeType);
        configurationVersion.setConfigurationSnapshot(serializeConfiguration(route));

        versionRepository.save(configurationVersion);
    }

    public ApiRoute restoreSnapshot(UUID versionId, UUID organizationId) throws AccessDeniedException {
        RouteConfigurationVersion version = versionRepository.findById(versionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Route version snapshot not found"));

        ApiRoute route = version.getRoute();

        if (!route.getOrganization().getId().equals(organizationId)) {
            throw new AccessDeniedException("Access denied to this route version");
        }

        if (route.getStatus() == RouteStatus.DELETED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot restore version of a deleted route. Restore the route first.");
        }

        RouteResponse snapshotResponse = deserializeConfiguration(version.getConfigurationSnapshot());

        List<RouteHeaderRule> rules = snapshotResponse.headerRules().stream().map(hr -> {
            RouteHeaderRule rule = new RouteHeaderRule();
            rule.setDirection(hr.direction());
            rule.setAction(hr.action());
            rule.setHeaderName(hr.headerName());
            rule.setHeaderValue(hr.headerValue());
            return rule;
        }).toList();

        route.setName(snapshotResponse.name());
        route.setPathPattern(getPathVariable(snapshotResponse.pathPattern()));
        route.setTargetBaseUrl(snapshotResponse.targetBaseUrl());
        route.setTargetPathPrefix(snapshotResponse.targetPathPrefix());
        route.setRequestsPerMinute(snapshotResponse.requestsPerMinute());
        route.setResponseTimeoutMs(snapshotResponse.responseTimeoutMs());
        route.setIdempotencyEnabled(snapshotResponse.idempotencyEnabled());
        route.setAllowedMethods(snapshotResponse.allowedMethods());
        route.setAllowedOrigins(snapshotResponse.allowedOrigins());
        route.setHeaderRules(rules);

        return route;
    }

    private static String getPathVariable(String restoredPath) {
        if (restoredPath != null) {
            while (restoredPath.startsWith("/")) {
                restoredPath = restoredPath.substring(1);
            }

            int firstSlash = restoredPath.indexOf('/');
            if (firstSlash != -1) {
                restoredPath = restoredPath.substring(firstSlash);
            } else {
                restoredPath = "/";
            }
        } else {
            restoredPath = "/";
        }
        return restoredPath;
    }

    private String serializeConfiguration(ApiRoute route) {
        try{
            return objectMapper.writeValueAsString(RouteResponse.from(route));
        } catch (JacksonException e) {
            throw new IllegalStateException("Failed to serialize route configuration", e);
        }
    }

    public RouteResponse deserializeConfiguration(String config){
        try{
            return objectMapper.readValue(config, RouteResponse.class);
        } catch (JacksonException e) {
            throw new IllegalStateException("Failed to parse route configuration snapshot", e);
        }
    }
}
