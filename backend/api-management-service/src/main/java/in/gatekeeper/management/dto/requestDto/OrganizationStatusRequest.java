package in.gatekeeper.management.dto.requestDto;

import in.gatekeeper.management.enums.OrganizationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record OrganizationStatusRequest(
        @NotNull(message = "Organization status is required")
        OrganizationStatus status
) { }
