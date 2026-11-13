package in.gatekeeper.analytics.service;

import in.gatekeeper.analytics.document.RouteAggregateDocument;
import in.gatekeeper.analytics.dto.responseDto.PlatformSummaryResponse;
import in.gatekeeper.analytics.dto.responseDto.TenantUsageResponse;
import in.gatekeeper.analytics.dto.responseDto.TimeSeriesPointResponse;
import in.gatekeeper.analytics.repository.RouteAggregateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlatformAnalyticsService {
    private final RouteAggregateRepository routeAggregateRepository;

    public PlatformSummaryResponse getPlatformSummary() {
        List<RouteAggregateDocument> allAggregates = routeAggregateRepository.findAll();

        long totalRequests = allAggregates.stream().mapToLong(RouteAggregateDocument::getTotalRequests).sum();
        long successCount = allAggregates.stream().mapToLong(RouteAggregateDocument::getSuccessCount).sum();
        long errorCount = allAggregates.stream().mapToLong(RouteAggregateDocument::getErrorCount).sum();

        long totalTenants = allAggregates.stream()
                .map(RouteAggregateDocument::getOrganizationId)
                .distinct()
                .count();

        double avgLatency = totalRequests == 0 ? 0.0 :
                allAggregates.stream().mapToDouble(a -> a.getAvgLatencyMs() * a.getTotalRequests()).sum() / totalRequests;

        double successRate = totalRequests == 0 ? 0.0 : (double) successCount / totalRequests * 100.0;

        return PlatformSummaryResponse.builder()
                .totalTenants(totalTenants)
                .totalRequests(totalRequests)
                .successCount(successCount)
                .errorCount(errorCount)
                .successRate(successRate)
                .avgLatencyMs(avgLatency)
                .build();
    }

    public List<TimeSeriesPointResponse> getPlatformTimeSeries(Instant from, Instant to) {
        List<RouteAggregateDocument> aggregate = routeAggregateRepository.findAllByHourBucketBetween(from, to);

        Map<Instant, List<RouteAggregateDocument>> groupedByHour = aggregate.stream()
                .collect(Collectors.groupingBy(RouteAggregateDocument::getTimestamp));

        return groupedByHour.entrySet().stream()
                .map(entry -> {
                    Instant timestamp = entry.getKey();
                    List<RouteAggregateDocument> docs = entry.getValue();

                    long totalRequests = docs.stream().mapToLong(RouteAggregateDocument::getTotalRequests).sum();
                    long successCount = docs.stream().mapToLong(RouteAggregateDocument::getSuccessCount).sum();
                    long errorCount = docs.stream().mapToLong(RouteAggregateDocument::getErrorCount).sum();

                    double avgLatencyMs = totalRequests == 0 ? 0 :
                            docs.stream().mapToDouble(d -> d.getAvgLatencyMs() * d.getTotalRequests()).sum() / totalRequests;

                    return TimeSeriesPointResponse.builder()
                            .timestamp(timestamp)
                            .totalRequests(totalRequests)
                            .successCount(successCount)
                            .errorCount(errorCount)
                            .avgLatencyMs(avgLatencyMs)
                            .build();
                })
                .toList();
    }

    public List<TenantUsageResponse> getTenantUsageBreakdown() {
        List<RouteAggregateDocument> allAggregates = routeAggregateRepository.findAll();

        Map<String, List<RouteAggregateDocument>> groupedByOrg = allAggregates.stream()
                .collect(Collectors.groupingBy(RouteAggregateDocument::getOrganizationId));

        return groupedByOrg.entrySet().stream()
                .map(entry -> {
                    String orgId = entry.getKey();
                    List<RouteAggregateDocument> docs = entry.getValue();

                    long totalReqs = docs.stream().mapToLong(RouteAggregateDocument::getTotalRequests).sum();
                    long successes = docs.stream().mapToLong(RouteAggregateDocument::getSuccessCount).sum();
                    long errors = docs.stream().mapToLong(RouteAggregateDocument::getErrorCount).sum();
                    double successRate = totalReqs == 0 ? 0.0 : (double) successes / totalReqs * 100.0;
                    double avgLat = totalReqs == 0 ? 0.0 :
                            docs.stream().mapToDouble(d -> d.getAvgLatencyMs() * d.getTotalRequests()).sum() / totalReqs;

                    return TenantUsageResponse.builder()
                            .organizationId(orgId)
                            .totalRequests(totalReqs)
                            .successCount(successes)
                            .errorCount(errors)
                            .successRate(successRate)
                            .avgLatencyMs(avgLat)
                            .build();
                })
                .toList();
    }
}
