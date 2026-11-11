package in.gatekeeper.gateway.service;

import in.gatekeeper.gateway.enums.HeaderDirection;
import in.gatekeeper.gateway.enums.IdempotencyStatus;
import in.gatekeeper.gateway.exception.GatewayPolicyException;
import in.gatekeeper.gateway.modal.CompiledRoute;
import in.gatekeeper.gateway.dto.responseDto.GatewayErrorResponse;
import in.gatekeeper.gateway.dto.responseDto.GatewayRoute;
import in.gatekeeper.gateway.enums.HttpMethod;
import in.gatekeeper.gateway.modal.IdempotencyRecord;
import in.gatekeeper.gateway.modal.RateLimitResult;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import tools.jackson.databind.ObjectMapper;

import java.time.Instant;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class GatewayService {

    private final RouteRegistry routeRegistry;
    private final RateLimitingService rateLimitingService;
    private final IdempotencyService idempotencyService;
    private final HeaderTransformationService headerTransformationService;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    public ResponseEntity<byte[]> handle(HttpServletRequest request) {
        long startedAt = System.nanoTime();

        String outcome = "TARGET_ERROR";
        int statusCode = HttpStatus.INTERNAL_SERVER_ERROR.value();
        boolean rateLimited = false;
        HttpHeaders policyHeaders = new HttpHeaders();

        String correlationId = correlationId(request);

        Optional<CompiledRoute> matchesRoute = routeRegistry.find(request.getRequestURI());

        if (matchesRoute.isEmpty()){
            outcome = "ROUTE_NOT_FOUND";
            statusCode = HttpStatus.NOT_FOUND.value();
            return error(HttpStatus.NOT_FOUND, "No active route matches", correlationId, null);
        }

        CompiledRoute compiledRoute = matchesRoute.get();
        GatewayRoute route = compiledRoute.gatewayRoute();

        // Method check
        HttpMethod method = HttpMethod.valueOf(request.getMethod());
        if (!route.allowedMethods().contains(method)){
            outcome = "METHOD_NOT_ALLOWED";
            statusCode = HttpStatus.METHOD_NOT_ALLOWED.value();

            HttpHeaders headers = new HttpHeaders();
            String allowedMethods = route.allowedMethods().stream()
                    .map(String::valueOf)
                    .collect(Collectors.joining(", "));

            headers.set(HttpHeaders.ALLOW, allowedMethods);

            return error(HttpStatus.METHOD_NOT_ALLOWED, "HTTP method is not allowed for this route", correlationId, headers);
        }

        // Rate limit check
        RateLimitResult rateLimit;
        try {
            rateLimit = rateLimitingService.check(route, request.getRemoteAddr());
        } catch (GatewayPolicyException e) {
            outcome = e.getOutcome();
            HttpHeaders headers = new HttpHeaders();
            return error(HttpStatus.SERVICE_UNAVAILABLE, e.getMessage(), correlationId, headers);
        } catch (Exception e) {
            log.error("Rate limiting error", e);
            return error(HttpStatus.SERVICE_UNAVAILABLE, "Rate limiting is temporarily unavailable", correlationId, null);
        }

        policyHeaders = rateLimitingService.rateLimitHeaders(rateLimit);

        if (!rateLimit.allowed()){
            rateLimited = true;
            outcome = "RATE_LIMITED";
            statusCode = HttpStatus.TOO_MANY_REQUESTS.value();

            policyHeaders.set(HttpHeaders.RETRY_AFTER, String.valueOf(rateLimit.retryAfterSeconds()));
            return error(HttpStatus.TOO_MANY_REQUESTS, "Rate limit exceeded", correlationId, policyHeaders);
        }

        byte[] requestBody;
        try{
            requestBody = request.getInputStream().readAllBytes();
        } catch (Exception e) {
            return error(HttpStatus.BAD_REQUEST, "Failed to read request body", correlationId, null);
        }

        // Idempotency check
        String idempotencyKey = null;
        String bodyHash = null;
        if (route.idempotencyEnabled() && (method == HttpMethod.POST || method == HttpMethod.PUT || method == HttpMethod.PATCH)){
            idempotencyKey = idempotencyService.extractKey(request);
            if (idempotencyKey == null) {
                return error(HttpStatus.BAD_REQUEST, "Idempotency-Key header is required for this route", correlationId, null);
            }
            bodyHash = idempotencyService.hashBody(requestBody);

            long responseTimeOutMs = route.responseTimeoutMs() == null ? 5000 : route.responseTimeoutMs();
            Optional<IdempotencyRecord> existing = idempotencyService.checkAndLock(route, idempotencyKey, bodyHash, responseTimeOutMs);
            if (existing.isPresent()){
                IdempotencyRecord record = existing.get();
                if (record.status() == IdempotencyStatus.IN_PROGRESS) {
                    return error(HttpStatus.CONFLICT, "Concurrent request with the same idempotency key is already in progress", correlationId, null);
                }
                if (!record.requestBodyHash().equals(bodyHash)) {
                    return error(HttpStatus.CONFLICT, "Idempotency key reused with a different request payload", correlationId, null);
                }

                HttpHeaders cachedHeaders = new HttpHeaders();
                record.responseHeaders().forEach(cachedHeaders::addAll);
                return ResponseEntity
                        .status(record.responseStatus())
                        .headers(cachedHeaders)
                        .body(record.responseBody());
            }
        }

        // request header rules
        HttpHeaders upstreamHeaders = new HttpHeaders();
        Collections.list(request.getHeaderNames()).forEach(headerName -> {
            Collections.list(request.getHeaders(headerName)).forEach(val -> {
                upstreamHeaders.add(headerName, val);
            });
        });
        headerTransformationService.applyRules(upstreamHeaders, route.headerRules(), HeaderDirection.REQUEST);

        try{
            String targetUrl = buildTargetUrl(route, request);
            HttpEntity<byte[]> upstreamEntity = new HttpEntity<>(requestBody, upstreamHeaders);

            // forwarding request
            ResponseEntity<byte[]> upstreamResponse = restTemplate.exchange(
                    targetUrl,
                    org.springframework.http.HttpMethod.valueOf(method.toString()),
                    upstreamEntity,
                    byte[].class
            );

            // response header rules
            HttpHeaders responseHeaders = new HttpHeaders();
            responseHeaders.putAll(upstreamResponse.getHeaders());
            headerTransformationService.applyRules(responseHeaders, route.headerRules(), HeaderDirection.RESPONSE);
            responseHeaders.set("X-Correlation-ID", correlationId);

            byte[] responseBody = upstreamResponse.getBody() == null ? new byte[0] : upstreamResponse.getBody();
            int responseStatusCode = upstreamResponse.getStatusCode().value();

            if (idempotencyKey != null && bodyHash != null){
                idempotencyService.saveCompletedResponse(
                        route,
                        idempotencyKey,
                        bodyHash,
                        responseStatusCode,
                        responseBody,
                        responseHeaders
                );
            }

            return ResponseEntity
                    .status(responseStatusCode)
                    .headers(responseHeaders)
                    .body(responseBody);

        } catch (Exception e) {
            log.error("Failed to proxy request to target upstream for route {}", route.routeId(), e);
            return error(HttpStatus.BAD_GATEWAY, "Gateway upstream communication failed: " + e.getMessage(), correlationId, null);
        }
    }

    private String buildTargetUrl(GatewayRoute route, HttpServletRequest request) {
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

        return baseUrl + targetPathPrefix + relativeUri;
    }

    private String extractTenantPrefix(String pathPattern) {
        if (pathPattern == null || pathPattern.isEmpty()) {
            return "";
        }

        String[] segments = pathPattern.split("/");
        if (segments.length > 1 && !segments[1].equals("**") && !segments[1].isEmpty()) {
            return "/" + segments[1];
        }
        return "";
    }

    private String correlationId(HttpServletRequest request) {
        String correlationId = request.getHeader("X-Correlation-ID");

        if (correlationId == null || correlationId.trim().isEmpty()){
            return UUID.randomUUID().toString();
        }

        return correlationId;
    }

    private ResponseEntity<byte[]> error(HttpStatus status, String message, String correlationId, HttpHeaders additionalHeaders){
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
