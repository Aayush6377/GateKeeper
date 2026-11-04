package in.gatekeeper.management.dto.requestDto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TenantAdminUpdateRequest(
        @NotBlank
        @Size(max = 100)
        String username,

        @Size(min = 8, max = 100)
        String password
) {
}
