package in.gatekeeper.management.dto.requestDto;

import in.gatekeeper.management.entity.ApiRoute;
import in.gatekeeper.management.entity.RouteHeaderRule;
import in.gatekeeper.management.enums.HttpMethod;
import in.gatekeeper.management.enums.RouteStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.util.List;
import java.util.Set;

public record RouteRequest(
        @NotBlank
        @Size(max = 100)
        String routeId,

        @NotBlank
        @Size(max = 200)
        String name,

        @NotBlank
        @Size(max = 500)
        String pathPattern,

        @NotBlank
        @Size(max = 1000)
        String targetBaseUrl,

        @Size(max = 500)
        String targetPathPrefix,

        @Positive
        Integer requestsPerMinute,

        @Positive
        Integer responseTimeoutMs,

        boolean idempotencyEnabled,

        @NotEmpty
        Set<@NotNull HttpMethod> allowedMethods,

        Set<String> allowedOrigins,

        @NotNull
        List<@Valid HeaderRuleRequest> headerRules
) {
    public RouteRequest {
        if (targetPathPrefix == null) {
            targetPathPrefix = "";
        }

        if (allowedMethods == null) {
            allowedMethods = Set.of();
        } else {
            allowedMethods = Set.copyOf(allowedMethods);
        }

        if (allowedOrigins == null) {
            allowedOrigins = Set.of();
        } else {
            allowedOrigins = Set.copyOf(allowedOrigins);
        }

        if (headerRules == null) {
            headerRules = List.of();
        } else {
            headerRules = List.copyOf(headerRules);
        }
    }

    private static RouteHeaderRule toHeaderRule(HeaderRuleRequest request) {
        RouteHeaderRule rule = new RouteHeaderRule();

        rule.setDirection(request.direction());
        rule.setAction(request.action());
        rule.setHeaderName(request.headerName());
        rule.setHeaderValue(request.headerValue());

        return rule;
    }

    public static void mapToApiRoute(ApiRoute route, RouteRequest request) {
        String cleanPath = request.pathPattern().trim();

        if (!cleanPath.startsWith("/")) {
            cleanPath = "/" + cleanPath;
        }

        cleanPath = cleanPath.replaceAll("/+", "/");

        if (route.getOrganization() != null && route.getOrganization().getSlug() != null) {
            String orgSlugPrefix = "/" + route.getOrganization().getSlug();
            if (cleanPath.startsWith(orgSlugPrefix)) {
                cleanPath = cleanPath.substring(orgSlugPrefix.length());
                if (!cleanPath.startsWith("/")) {
                    cleanPath = "/" + cleanPath;
                }
            }
        }

        route.setRouteId(request.routeId());
        route.setName(request.name());
        route.setPathPattern(cleanPath);
        route.setTargetBaseUrl(request.targetBaseUrl());
        route.setTargetPathPrefix(request.targetPathPrefix());
        route.setRequestsPerMinute(request.requestsPerMinute());
        route.setResponseTimeoutMs(request.responseTimeoutMs());
        route.setIdempotencyEnabled(request.idempotencyEnabled());
        route.setAllowedMethods(request.allowedMethods());
        route.setAllowedOrigins(request.allowedOrigins());

        List<RouteHeaderRule> rules =  request.headerRules().stream()
                .map(RouteRequest::toHeaderRule)
                .toList();

        route.setHeaderRules(rules);
    }
}
