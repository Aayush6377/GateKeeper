package in.gatekeeper.management.dto.responseDto;

import in.gatekeeper.management.entity.ManagementUser;
import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

@Builder
public record TenantAdminResponse(
        UUID id,
        String username,
        OrganizationResponse organization,
        Instant createdAt,
        Instant updatedAt
) {

    public static TenantAdminResponse from(ManagementUser user) {
        OrganizationResponse organizationResponse = OrganizationResponse.from(user.getOrganization());

        return TenantAdminResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .organization(organizationResponse)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
