package in.gatekeeper.analytics.service;

import in.gatekeeper.analytics.document.RouteAggregateDocument;
import in.gatekeeper.analytics.dto.responseDto.AnalyticsSummaryResponse;
import in.gatekeeper.analytics.dto.responseDto.RouteMetricResponse;
import in.gatekeeper.analytics.dto.responseDto.TimeSeriesPointResponse;
import in.gatekeeper.analytics.repository.RouteAggregateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TenantAnalyticsService {
    private final RouteAggregateRepository routeAggregateRepository;

    public AnalyticsSummaryResponse getSummary(String organizationId) {
        List<RouteAggregateDocument> aggregates = routeAggregateRepository.findAllByOrganizationId(organizationId);

        long totalRequests = aggregates.stream().mapToLong(RouteAggregateDocument::getTotalRequests).sum();
        long successCount = aggregates.stream().mapToLong(RouteAggregateDocument::getSuccessCount).sum();
        long errorCount = aggregates.stream().mapToLong(RouteAggregateDocument::getErrorCount).sum();

        double avgLatencyMs = totalRequests == 0 ? 0.0 :
                aggregates.stream().mapToDouble(a -> a.getAvgLatencyMs() * a.getTotalRequests()).sum() / totalRequests;

        double successRate = totalRequests == 0 ? 0.0 : (double) successCount / totalRequests * 100.0;

        return AnalyticsSummaryResponse.builder()
                .totalRequests(totalRequests)
                .successCount(successCount)
                .errorCount(errorCount)
                .successRate(successRate)
                .avgLatencyMs(avgLatencyMs)
                .build();
    }

    public List<TimeSeriesPointResponse> getTimeSeries(String organizationId, Instant from, Instant to) {
        List<RouteAggregateDocument> aggregates = routeAggregateRepository.findAllByOrganizationIdAndHourBucketBetween(organizationId, from, to);

        Map<Instant, List<RouteAggregateDocument>> groupedByHour = aggregates.stream()
                .collect(Collectors.groupingBy(RouteAggregateDocument::getHourBucket));

        return groupedByHour.entrySet().stream()
                .map(entry -> {
                    Instant hour = entry.getKey();
                    List<RouteAggregateDocument> docs = entry.getValue();

                    long totalRequests = docs.stream().mapToLong(RouteAggregateDocument::getTotalRequests).sum();
                    long successCount = docs.stream().mapToLong(RouteAggregateDocument::getSuccessCount).sum();
                    long errorCount = docs.stream().mapToLong(RouteAggregateDocument::getErrorCount).sum();

                    double avgLatencyMs = totalRequests == 0 ? 0.0 :
                            docs.stream().mapToDouble(d -> d.getAvgLatencyMs() * d.getTotalRequests()).sum() / totalRequests;

                    return TimeSeriesPointResponse.builder()
                            .timestamp(hour)
                            .totalRequests(totalRequests)
                            .successCount(successCount)
                            .errorCount(errorCount)
                            .avgLatencyMs(avgLatencyMs)
                            .build();
                })
                .sorted(Comparator.comparing(TimeSeriesPointResponse::timestamp))
                .toList();
    }

    public List<RouteMetricResponse> getRouteMetrics(String organizationId) {
        List<RouteAggregateDocument> aggregates = routeAggregateRepository.findAllByOrganizationId(organizationId);

        Map<String, List<RouteAggregateDocument>> groupedByRoute = aggregates.stream()
                .collect(Collectors.groupingBy(RouteAggregateDocument::getRouteId));

        return groupedByRoute.entrySet().stream()
                .map(entry -> {
                    String routeId = entry.getKey();
                    List<RouteAggregateDocument> docs = entry.getValue();

                    String routeName = docs.isEmpty() ? "Unknown" : docs.getFirst().getRouteName();
                    long totalRequests = docs.stream().mapToLong(RouteAggregateDocument::getTotalRequests).sum();
                    long successes = docs.stream().mapToLong(RouteAggregateDocument::getSuccessCount).sum();
                    long errors = docs.stream().mapToLong(RouteAggregateDocument::getErrorCount).sum();
                    double successRate = totalRequests == 0 ? 0.0 : (double) successes / totalRequests * 100.0;
                    double avgLat = totalRequests == 0 ? 0.0 :
                            docs.stream().mapToDouble(d -> d.getAvgLatencyMs() * d.getTotalRequests()).sum() / totalRequests;

                    return RouteMetricResponse.builder()
                            .routeId(routeId)
                            .routeName(routeName)
                            .totalRequests(totalRequests)
                            .successCount(successes)
                            .errorCount(errors)
                            .successRate(successRate)
                            .avgLatencyMs(avgLat)
                            .build();

                })
                .toList();
    }
}
