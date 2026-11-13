package in.gatekeeper.analytics.dto.responseDto;

import lombok.Builder;

@Builder
public record AnalyticsSummaryResponse(
        long totalRequests,
        long successCount,
        long errorCount,
        double successRate,
        double avgLatencyMs
) { }
