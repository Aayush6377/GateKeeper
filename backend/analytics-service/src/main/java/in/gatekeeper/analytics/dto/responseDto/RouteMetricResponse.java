package in.gatekeeper.analytics.dto.responseDto;

import lombok.Builder;

@Builder
public record RouteMetricResponse(
        String routeId,
        String routeName,
        long totalRequests,
        long successCount,
        long errorCount,
        double successRate,
        double avgLatencyMs
) { }
