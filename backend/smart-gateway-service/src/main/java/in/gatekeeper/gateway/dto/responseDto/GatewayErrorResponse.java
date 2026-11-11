package in.gatekeeper.gateway.dto.responseDto;

import lombok.Builder;

import java.time.Instant;

@Builder
public record GatewayErrorResponse(
        int status,
        String message,
        String correlationId,
        Instant timestamp
) { }
