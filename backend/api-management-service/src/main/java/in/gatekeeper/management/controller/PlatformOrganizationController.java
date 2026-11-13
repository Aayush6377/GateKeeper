package in.gatekeeper.management.controller;

import in.gatekeeper.management.dto.requestDto.*;
import in.gatekeeper.management.dto.responseDto.*;
import in.gatekeeper.management.service.OrganizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/platform/organizations")
@RequiredArgsConstructor
public class PlatformOrganizationController {

    private final OrganizationService organizationService;

    @PostMapping
    public ResponseEntity<OrganizationResponse> create(@Valid @RequestBody OrganizationRequest request){
        OrganizationResponse result = organizationService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @GetMapping
    public ResponseEntity<PageResponse<OrganizationResponse>> findAll(@Valid @ModelAttribute PaginationRequest request){
        return ResponseEntity.ok(organizationService.findAll(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrganizationResponse> findById(@PathVariable UUID id){
        return ResponseEntity.ok(organizationService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrganizationResponse> update(@PathVariable UUID id, @Valid @RequestBody OrganizationRequest request){
        return ResponseEntity.ok(organizationService.update(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OrganizationResponse> changeStatus(@PathVariable UUID id, @Valid @RequestBody OrganizationStatusRequest request){
        return ResponseEntity.ok(organizationService.changeStatus(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id){
        organizationService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/deleted")
    public ResponseEntity<PageResponse<OrganizationResponse>> findAllDeletedOrganizations(@Valid @ModelAttribute PaginationRequest request){
        return ResponseEntity.ok(organizationService.findAllDeletedOrganization(request));
    }

    @PatchMapping("/{id}/restore")
    public ResponseEntity<OrganizationResponse> restore(@PathVariable UUID id){
        OrganizationResponse result = organizationService.restore(id);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/batch-names")
    public ResponseEntity<List<OrganizationNameDto>> getOrganizationNamesBatch(@RequestBody List<UUID> organizationIds){
        return ResponseEntity.ok(organizationService.getOrganizationNamesBatch(organizationIds));
    }

    @PostMapping("/{organizationId}/tenant-admin")
    public ResponseEntity<TenantAdminResponse> createTenantAdmin(@PathVariable UUID organizationId, @Valid @RequestBody TenantAdminRequest request){
        TenantAdminResponse result = organizationService.createTenantAdmin(organizationId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @GetMapping("/{organizationId}/tenant-admin")
    public ResponseEntity<TenantAdminListResponse> getAllTenantAdmins(@PathVariable UUID organizationId, @ModelAttribute PaginationRequest request){
        var result = organizationService.getAllTenantAdmin(organizationId, request);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/tenant-admin/{userId}")
    public ResponseEntity<TenantAdminResponse> getTenantAdmin(@PathVariable UUID userId){
        TenantAdminResponse result = organizationService.getTenantAdmin(userId);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/tenant-admin/{userId}")
    public ResponseEntity<TenantAdminResponse> updateTenantAdmin(@PathVariable UUID userId, @Valid @RequestBody TenantAdminUpdateRequest request){
        TenantAdminResponse result = organizationService.updateTenantAdmin(userId, request);
        return ResponseEntity.ok(result);
    }

    @PatchMapping("/tenant-admin/{userId}/enable")
    public ResponseEntity<TenantAdminResponse> changeTenantAdminEnable(@PathVariable UUID userId, @Valid @RequestBody TenantAdminEnableRequest request){
        TenantAdminResponse result = organizationService.changeTenantAdminEnable(userId, request);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/tenant-admin/{userId}")
    public ResponseEntity<Void> deleteTenantAdmin(@PathVariable UUID userId){
        organizationService.deleteTenantAdmin(userId);
        return ResponseEntity.noContent().build();
    }
}
