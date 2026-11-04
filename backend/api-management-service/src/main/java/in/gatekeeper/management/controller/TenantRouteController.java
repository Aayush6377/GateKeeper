package in.gatekeeper.management.controller;

import in.gatekeeper.management.dto.requestDto.PaginationRequest;
import in.gatekeeper.management.dto.requestDto.RouteRequest;
import in.gatekeeper.management.dto.requestDto.RouteStatusRequest;
import in.gatekeeper.management.dto.responseDto.PageResponse;
import in.gatekeeper.management.dto.responseDto.RouteListVersionResponse;
import in.gatekeeper.management.dto.responseDto.RouteResponse;
import in.gatekeeper.management.dto.responseDto.RouteVersionResponse;
import in.gatekeeper.management.service.RouteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tenant/routes")
@RequiredArgsConstructor
public class TenantRouteController {

    private final RouteService routeService;

    @PostMapping
    public ResponseEntity<RouteResponse> create(@Valid @RequestBody RouteRequest request){
        RouteResponse result = routeService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @GetMapping
    public ResponseEntity<PageResponse<RouteResponse>> gelAllRoutes(@Valid @ModelAttribute PaginationRequest request){
        return ResponseEntity.ok(routeService.getAllRoutes(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RouteResponse> getRoute(@PathVariable UUID id) throws AccessDeniedException {
        return ResponseEntity.ok(routeService.getRoute(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RouteResponse> updateRoute(@PathVariable UUID id, @Valid @RequestBody RouteRequest request){
        return ResponseEntity.ok(routeService.updateRoute(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoute(@PathVariable UUID id) throws AccessDeniedException {
        routeService.deleteRoute(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/deleted")
    public ResponseEntity<PageResponse<RouteResponse>> gelAllDeletedRoutes(@Valid @ModelAttribute PaginationRequest request){
        return ResponseEntity.ok(routeService.getAllDeletedRoutes(request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<RouteResponse> changeStatus(@PathVariable UUID id, @Valid @RequestBody RouteStatusRequest request) throws AccessDeniedException {
        return ResponseEntity.ok(routeService.changeStatus(id, request));
    }

    @PostMapping("/{id}/restore")
    public ResponseEntity<RouteResponse> restoreRoute(@PathVariable UUID id){
        return ResponseEntity.ok(routeService.restoreRoute(id));
    }

    @GetMapping("/versions/{routeId}")
    public ResponseEntity<RouteListVersionResponse> getVersions(@PathVariable UUID routeId, @Valid @ModelAttribute PaginationRequest request) throws AccessDeniedException {
        return ResponseEntity.ok(routeService.getVersions(routeId, request));
    }

    @PostMapping("/versions/{versionId}/restore")
    public ResponseEntity<RouteResponse> restoreVersion(@PathVariable UUID versionId) throws AccessDeniedException {
        return ResponseEntity.ok(routeService.restoreVersion(versionId));
    }

}
