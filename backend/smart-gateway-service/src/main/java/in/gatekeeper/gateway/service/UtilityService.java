package in.gatekeeper.gateway.service;

import in.gatekeeper.gateway.dto.responseDto.GatewayErrorResponse;
import in.gatekeeper.gateway.dto.responseDto.GatewayRoute;
import in.gatekeeper.gateway.event.AccessEventProducer;
import in.gatekeeper.gateway.modal.AccessEventPayload;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UtilityService {

    private final AccessEventProducer accessEventProducer;
    private final ObjectMapper objectMapper;

    void recordTelemetry(GatewayRoute route, HttpServletRequest request, String method, int statusCode, String outcome, long startedAt, String correlationId) {
        try {
            long latencyMs = (System.nanoTime() - startedAt) / 1_000_000;
            AccessEventPayload event = AccessEventPayload.builder()
                    .organizationId(route != null ? route.organizationId().toString() : null)
                    .routeId(route != null ? route.routeId() : "UNKNOWN")
                    .correlationId(correlationId)
                    .routeName(route != null ? route.name() : "UNKNOWN")
                    .method(method != null ? method : "UNKNOWN")
                    .requestPath(request.getRequestURI())
                    .statusCode(statusCode)
                    .latencyMs(latencyMs)
                    .clientIp(request.getRemoteAddr())
                    .outcome(outcome)
                    .timestamp(Instant.now())
                    .build();

            accessEventProducer.sendAccessEvent(event);
        } catch (Exception ex) {
            log.error("Failed to record access event telemetry", ex);
        }
    }

    String buildTargetUrl(GatewayRoute route, HttpServletRequest request) {
        String baseUrl = route.targetBaseUrl();
        String requestUri = request.getRequestURI();

        String tenantPrefix = extractTenantPrefix(route.pathPattern());

        String relativeUri = requestUri;
        if (!tenantPrefix.isEmpty() && requestUri.startsWith(tenantPrefix)) {
            relativeUri = requestUri.substring(tenantPrefix.length());
        }

        if (!relativeUri.startsWith("/")) {
            relativeUri = "/" + relativeUri;
        }

        String targetPathPrefix = route.targetPathPrefix() != null ? route.targetPathPrefix() : "";
        String targetUrl = baseUrl + targetPathPrefix + relativeUri;

        String queryString = request.getQueryString();
        if (queryString != null && !queryString.isBlank()) {
            targetUrl += "?" + queryString;
        }

        return targetUrl;
    }

    String extractTenantPrefix(String pathPattern) {
        if (pathPattern == null || pathPattern.isEmpty()) {
            return "";
        }

        String[] segments = pathPattern.split("/");
        if (segments.length > 1 && !segments[1].equals("**") && !segments[1].isEmpty()) {
            return "/" + segments[1];
        }
        return "";
    }

    String correlationId(HttpServletRequest request) {
        String correlationId = request.getHeader("X-Correlation-ID");

        if (correlationId == null || correlationId.trim().isEmpty()) {
            return UUID.randomUUID().toString();
        }

        return correlationId;
    }

    ResponseEntity<byte[]> error(HttpStatus status, String message, String correlationId, HttpHeaders additionalHeaders) {
        GatewayErrorResponse response = GatewayErrorResponse.builder()
                .status(status.value())
                .message(message)
                .correlationId(correlationId)
                .timestamp(Instant.now())
                .build();

        HttpHeaders headers = additionalHeaders == null ? new HttpHeaders() : additionalHeaders;

        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Correlation-ID", correlationId);

        return ResponseEntity.status(status).headers(headers)
                .body(objectMapper.writeValueAsBytes(response));
    }
}
