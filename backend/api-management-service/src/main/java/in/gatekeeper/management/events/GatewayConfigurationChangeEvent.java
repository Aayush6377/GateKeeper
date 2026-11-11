package in.gatekeeper.management.events;

import in.gatekeeper.management.dto.responseDto.RouteResponse;
import in.gatekeeper.management.enums.ConfigurationChangeType;
import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

@Builder
public record GatewayConfigurationChangeEvent (
        UUID eventId,
        String eventType,
        ConfigurationChangeType changeType,
        UUID organizationId,
        String routeId,
        Long configurationVersion,
        RouteResponse routePayload,
        Instant occurredAt
) { }
