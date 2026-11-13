package in.gatekeeper.management.dto.responseDto;

import in.gatekeeper.management.entity.Organization;
import lombok.Builder;

import java.util.UUID;

@Builder
public record OrganizationNameDto(
        UUID organizationId,
        String organizationName
) {
    public static OrganizationNameDto from(Organization organization){
        return OrganizationNameDto.builder()
                .organizationId(organization.getId())
                .organizationName(organization.getName())
                .build();
    }
}
