package in.gatekeeper.management.dto.responseDto;

import in.gatekeeper.management.entity.ManagementUser;
import in.gatekeeper.management.entity.Organization;
import lombok.Builder;
import org.springframework.data.domain.Page;

import java.time.Instant;
import java.util.UUID;

@Builder
public record TenantAdminListResponse(
        OrganizationResponse organization,
        PageResponse<TenantAdminListItem> users
) {

    @Builder
    private record TenantAdminListItem(
            UUID id,
            String username,
            boolean enabled,
            Instant createdAt,
            Instant updatedAt
    ){}

    public static TenantAdminListResponse from(Organization organization, Page<ManagementUser> users){
        OrganizationResponse organizationResponse = OrganizationResponse.from(organization);

        PageResponse<TenantAdminListItem> userResponse = PageResponse.from(users, user ->
                TenantAdminListItem.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .enabled(user.isEnabled())
                        .createdAt(user.getCreatedAt())
                        .updatedAt(user.getUpdatedAt())
                        .build()
        );

        return TenantAdminListResponse.builder()
                .organization(organizationResponse)
                .users(userResponse)
                .build();
    }
}
