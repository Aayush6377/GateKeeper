package in.gatekeeper.management.dto.responseDto;

import in.gatekeeper.management.entity.RouteConfigurationVersion;
import in.gatekeeper.management.enums.RouteChangeType;
import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

@Builder
public record RouteVersionResponse(
        UUID id,
        Long versionNumber,
        RouteChangeType changeType,
        RouteResponse configurationSnapshot,
        Instant createdAt
) {
    public static RouteVersionResponse from(RouteConfigurationVersion version, RouteResponse snapshot){
        return RouteVersionResponse.builder()
                .id(version.getId())
                .versionNumber(version.getVersionNumber())
                .changeType(version.getChangeType())
                .configurationSnapshot(snapshot)
                .createdAt(version.getCreatedAt())
                .build();
    }
}
