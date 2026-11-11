package in.gatekeeper.gateway.event;

import in.gatekeeper.gateway.dto.responseDto.GatewayRoute;
import in.gatekeeper.gateway.enums.ConfigurationChangeType;

import java.time.Instant;
import java.util.UUID;

public record GatewayConfigurationChangeEvent(
        UUID eventId,
        String eventType,
        ConfigurationChangeType changeType,
        UUID organizationId,
        String routeId,
        Long configurationVersion,
        GatewayRoute routePayload,
        Instant occurredAt
) { }
