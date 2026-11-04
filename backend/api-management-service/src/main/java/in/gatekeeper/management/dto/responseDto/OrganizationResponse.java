package in.gatekeeper.management.dto.responseDto;

import in.gatekeeper.management.entity.Organization;
import in.gatekeeper.management.enums.OrganizationStatus;
import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

@Builder
public record OrganizationResponse(
        UUID id,
        String name,
        String slug,
        OrganizationStatus status,
        Instant createdAt,
        Instant updatedAt
) {

    public static OrganizationResponse from(Organization organization){
        return OrganizationResponse.builder()
                .id(organization.getId())
                .name(organization.getName())
                .slug(organization.getSlug())
                .status(organization.getStatus())
                .createdAt(organization.getCreatedAt())
                .updatedAt(organization.getUpdatedAt())
                .build();
    }
}
