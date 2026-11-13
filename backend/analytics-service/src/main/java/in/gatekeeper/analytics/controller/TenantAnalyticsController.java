package in.gatekeeper.analytics.controller;

import in.gatekeeper.analytics.dto.responseDto.AnalyticsSummaryResponse;
import in.gatekeeper.analytics.dto.responseDto.RouteMetricResponse;
import in.gatekeeper.analytics.dto.responseDto.TimeSeriesPointResponse;
import in.gatekeeper.analytics.service.TenantAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/v1/analytics/tenant")
@RequiredArgsConstructor
public class TenantAnalyticsController {
    private final TenantAnalyticsService analyticsService;

    @GetMapping("/summary")
    public ResponseEntity<AnalyticsSummaryResponse> getSummary(@AuthenticationPrincipal Jwt jwt){
        String organizationId = jwt.getClaimAsString("organizationId");
        return ResponseEntity.ok(analyticsService.getSummary(organizationId));
    }

    @GetMapping("/timeseries")
    public ResponseEntity<List<TimeSeriesPointResponse>> getTimeSeries(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to
    ){
        String organizationId = jwt.getClaimAsString("organizationId");
        return ResponseEntity.ok(analyticsService.getTimeSeries(organizationId, from, to));
    }

    @GetMapping("/routes")
    public ResponseEntity<List<RouteMetricResponse>> getRouteMetrics(@AuthenticationPrincipal Jwt jwt){
        String organizationId = jwt.getClaimAsString("organizationId");
        return ResponseEntity.ok(analyticsService.getRouteMetrics(organizationId));
    }
}
