package in.gatekeeper.management.service;

import in.gatekeeper.management.dto.responseDto.RouteResponse;
import in.gatekeeper.management.entity.ApiRoute;
import in.gatekeeper.management.entity.Organization;
import in.gatekeeper.management.enums.OrganizationStatus;
import in.gatekeeper.management.enums.RouteStatus;
import in.gatekeeper.management.repository.ApiRouteRepository;
import in.gatekeeper.management.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GatewayRouteService {

    private final ApiRouteRepository apiRouteRepository;
    private final OrganizationRepository organizationRepository;

    @Transactional(readOnly = true)
    public List<RouteResponse> findAllActiveForGateway() {
        List<ApiRoute> routes = apiRouteRepository.findAllByStatusAndOrganization_Status(
                RouteStatus.ACTIVE,
                OrganizationStatus.ACTIVE
        );

        return routes.stream()
                .map(RouteResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RouteResponse> getActiveRoutesByOrganizationId(UUID organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization Not Found"));

        if (organization.getStatus() != OrganizationStatus.ACTIVE){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Organization is not active");
        }

        List<ApiRoute> routes = apiRouteRepository.findAllByStatusAndOrganization(
                RouteStatus.ACTIVE,
                organization
        );

        return routes.stream()
                .map(RouteResponse::from)
                .toList();
    }
}
