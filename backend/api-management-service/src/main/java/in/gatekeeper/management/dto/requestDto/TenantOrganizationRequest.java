package in.gatekeeper.management.dto.requestDto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TenantOrganizationRequest(
        @NotBlank
        @Size(max = 150)
        String name
) { }
