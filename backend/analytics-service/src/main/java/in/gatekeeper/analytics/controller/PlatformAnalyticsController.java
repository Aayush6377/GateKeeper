package in.gatekeeper.analytics.controller;

import in.gatekeeper.analytics.dto.responseDto.PlatformSummaryResponse;
import in.gatekeeper.analytics.dto.responseDto.TenantUsageResponse;
import in.gatekeeper.analytics.dto.responseDto.TimeSeriesPointResponse;
import in.gatekeeper.analytics.service.PlatformAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/v1/analytics/platform")
@RequiredArgsConstructor
public class PlatformAnalyticsController {
    private final PlatformAnalyticsService analyticsService;

    @GetMapping("/summary")
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    public ResponseEntity<PlatformSummaryResponse> getPlatformSummary(@AuthenticationPrincipal Jwt jwt){
        return ResponseEntity.ok(analyticsService.getPlatformSummary());
    }

    @GetMapping("/timeseries")
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    public ResponseEntity<List<TimeSeriesPointResponse>> getPlatformTimeSeries(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to
    ){
        return ResponseEntity.ok(analyticsService.getPlatformTimeSeries(from, to));
    }

    @GetMapping("/tenants")
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    public ResponseEntity<List<TenantUsageResponse>> getTenantUsageBreakdown(){
        return ResponseEntity.ok(analyticsService.getTenantUsageBreakdown());
    }
}
