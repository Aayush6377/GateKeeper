package in.gatekeeper.management.dto.responseDto;

import in.gatekeeper.management.entity.ApiRoute;
import in.gatekeeper.management.entity.RouteHeaderRule;
import in.gatekeeper.management.enums.HttpMethod;
import in.gatekeeper.management.enums.RouteStatus;
import lombok.Builder;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Builder
public record RouteResponse(
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
        Set<String> allowedOrigins,
        List<RouteHeaderRuleResponse> headerRules,
        Instant createdAt,
        Instant updatedAt
) {
    public static RouteResponse from(ApiRoute route){
        List<RouteHeaderRuleResponse> headerRuleResponses = new ArrayList<>();

        for (RouteHeaderRule routeHeaderRule: route.getHeaderRules()){
            headerRuleResponses.add(RouteHeaderRuleResponse.from(routeHeaderRule));
        }

        String organizationSlug = route.getOrganization() != null ? route.getOrganization().getSlug() : "";
        String relativePath = route.getPathPattern();

        if (relativePath != null && !relativePath.startsWith("/")) {
            relativePath = "/" + relativePath;
        }

        String fullPathPattern = "/" + organizationSlug + relativePath;

        return RouteResponse.builder()
                .id(route.getId())
                .organizationId(route.getOrganization().getId())
                .routeId(route.getRouteId())
                .name(route.getName())
                .pathPattern(fullPathPattern)
                .targetBaseUrl(route.getTargetBaseUrl())
                .targetPathPrefix(route.getTargetPathPrefix())
                .requestsPerMinute(route.getRequestsPerMinute())
                .responseTimeoutMs(route.getResponseTimeoutMs())
                .idempotencyEnabled(route.isIdempotencyEnabled())
                .status(route.getStatus())
                .configurationVersion(route.getConfigurationVersion())
                .allowedMethods(route.getAllowedMethods())
                .allowedOrigins(route.getAllowedOrigins())
                .headerRules(headerRuleResponses)
                .createdAt(route.getCreatedAt())
                .updatedAt(route.getUpdatedAt())
                .build();
    }
}
