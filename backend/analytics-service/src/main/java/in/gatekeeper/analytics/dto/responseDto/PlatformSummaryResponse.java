package in.gatekeeper.analytics.dto.responseDto;

import lombok.Builder;

@Builder
public record PlatformSummaryResponse (
    long totalTenants,
    long totalRequests,
    long successCount,
    long errorCount,
    double successRate,
    double avgLatencyMs
) { }
