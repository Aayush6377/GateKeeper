package in.gatekeeper.gateway.modal;

import in.gatekeeper.gateway.enums.IdempotencyStatus;
import lombok.Builder;

import java.util.List;
import java.util.Map;

@Builder
public record IdempotencyRecord(
        IdempotencyStatus status,
        String  requestBodyHash,
        byte[] responseBody,
        int responseStatus,
        Map<String, List<String>> responseHeaders,
        long createdAt
) { }
