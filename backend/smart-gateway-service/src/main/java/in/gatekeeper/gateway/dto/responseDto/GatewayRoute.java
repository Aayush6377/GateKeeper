package in.gatekeeper.gateway.dto.responseDto;

import in.gatekeeper.gateway.enums.HttpMethod;
import in.gatekeeper.gateway.enums.RouteStatus;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

public record GatewayRoute(
        UUID id,
        UUID organizationId,
        String routeId,
        String name,
        String pathPattern,
        String targetBaseUrl,
        String targetPathPrefix,
        Integer requestsPerMinute,
        Integer responseTimeoutMs,
        boolean idempotencyEnabled,
        RouteStatus status,
        Long configurationVersion,
        Set<HttpMethod> allowedMethods,
        List<HeaderRule> headerRules,
        Instant createdAt,
        Instant updatedAt
) { }