package in.gatekeeper.management.controller;

import in.gatekeeper.management.dto.requestDto.TenantOrganizationRequest;
import in.gatekeeper.management.dto.responseDto.OrganizationResponse;
import in.gatekeeper.management.service.OrganizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tenant")
@RequiredArgsConstructor
public class TenantController {
    private final OrganizationService organizationService;

    @GetMapping("/organization")
    public ResponseEntity<OrganizationResponse> getOwnOrganization() {
        OrganizationResponse result = organizationService.getOwnOrganization();
        return ResponseEntity.ok(result);
    }

    @PutMapping("/organization")
    public ResponseEntity<OrganizationResponse> updateOwnOrganization(@Valid @RequestBody TenantOrganizationRequest request){
        OrganizationResponse result = organizationService.updateOwnOrganization(request);
        return ResponseEntity.ok(result);
    }
}
