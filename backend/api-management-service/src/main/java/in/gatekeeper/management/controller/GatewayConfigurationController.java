package in.gatekeeper.management.controller;

import in.gatekeeper.management.dto.responseDto.RouteResponse;
import in.gatekeeper.management.service.GatewayRouteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/gateway/routes")
@RequiredArgsConstructor
public class GatewayConfigurationController {
    private final GatewayRouteService routeService;

    @GetMapping
    public ResponseEntity<List<RouteResponse>> getActiveRoutes(){
        return ResponseEntity.ok(routeService.findAllActiveForGateway());
    }

    @GetMapping("/{organizationId}")
    public ResponseEntity<List<RouteResponse>> getActiveRoutesByOrganizationId(@PathVariable UUID organizationId){
        return ResponseEntity.ok(routeService.getActiveRoutesByOrganizationId(organizationId));
    }
}
