package in.gatekeeper.management.dto.requestDto;

import jakarta.validation.constraints.NotNull;

public record TenantAdminEnableRequest(
        @NotNull Boolean enable
) {
}
