package in.gatekeeper.management.controller;

import in.gatekeeper.management.dto.projectionDto.GatewayRouteProjection;
import in.gatekeeper.management.service.RouteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/gateway/routes")
@RequiredArgsConstructor
public class GatewayConfigurationController {
    private final RouteService routeService;

    @GetMapping
    public ResponseEntity<List<GatewayRouteProjection>> getActiveRoutes(){
        return ResponseEntity.ok(routeService.findAllActiveForGateway());
    }
}
