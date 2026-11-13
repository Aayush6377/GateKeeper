package in.gatekeeper.analytics.dto.responseDto;

import lombok.Builder;

import java.time.Instant;

@Builder
public record TimeSeriesPointResponse(
        Instant timestamp,
        long totalRequests,
        long successCount,
        long errorCount,
        double avgLatencyMs
) { }
