package in.gatekeeper.gateway.modal;

import lombok.Builder;

import java.time.Instant;

@Builder
public record AccessEventPayload(
        String organizationId,
        String routeId,
        String correlationId,
        String routeName,
        String method,
        String requestPath,
        int statusCode,
        long latencyMs,
        String clientIp,
        String outcome,
        Instant timestamp
) { }
