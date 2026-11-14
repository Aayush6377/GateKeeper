package in.gatekeeper.gateway.service;

import in.gatekeeper.gateway.enums.HeaderDirection;
import in.gatekeeper.gateway.enums.IdempotencyStatus;
import in.gatekeeper.gateway.event.AccessEventProducer;
import in.gatekeeper.gateway.exception.GatewayPolicyException;
import in.gatekeeper.gateway.modal.AccessEventPayload;
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
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResponseErrorHandler;
import org.springframework.web.client.RestTemplate;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
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
    private final UtilityService utilityService;

    public ResponseEntity<byte[]> handle(HttpServletRequest request) {
        long startedAt = System.nanoTime();

        String outcome = "TARGET_ERROR";
        int statusCode = HttpStatus.INTERNAL_SERVER_ERROR.value();
        String correlationId = utilityService.correlationId(request);
        GatewayRoute route = null;
        HttpMethod method = null;

        try {
            Optional<CompiledRoute> matchesRoute = routeRegistry.find(request.getRequestURI());

            if (matchesRoute.isEmpty()) {
                outcome = "ROUTE_NOT_FOUND";
                statusCode = HttpStatus.NOT_FOUND.value();
                ResponseEntity<byte[]> response = utilityService.error(HttpStatus.NOT_FOUND, "No active route matches", correlationId, null);
                utilityService.recordTelemetry(null, request, method != null ? method.name() : request.getMethod(), statusCode, outcome, startedAt, correlationId);
                return response;
            }

            CompiledRoute compiledRoute = matchesRoute.get();
            route = compiledRoute.gatewayRoute();

            // Method check
            method = HttpMethod.valueOf(request.getMethod());
            if (!route.allowedMethods().contains(method)) {
                outcome = "METHOD_NOT_ALLOWED";
                statusCode = HttpStatus.METHOD_NOT_ALLOWED.value();

                HttpHeaders headers = new HttpHeaders();
                String allowedMethods = route.allowedMethods().stream()
                        .map(String::valueOf)
                        .collect(Collectors.joining(", "));
                headers.set(HttpHeaders.ALLOW, allowedMethods);

                ResponseEntity<byte[]> response = utilityService.error(HttpStatus.METHOD_NOT_ALLOWED, "HTTP method is not allowed for this route", correlationId, headers);
                utilityService.recordTelemetry(route, request, method.name(), statusCode, outcome, startedAt, correlationId);
                return response;
            }

            // Rate limit check
            RateLimitResult rateLimit;
            try {
                rateLimit = rateLimitingService.check(route, request.getRemoteAddr());
            } catch (GatewayPolicyException e) {
                outcome = e.getOutcome();
                statusCode = HttpStatus.SERVICE_UNAVAILABLE.value();
                ResponseEntity<byte[]> response = utilityService.error(HttpStatus.SERVICE_UNAVAILABLE, e.getMessage(), correlationId, new HttpHeaders());
                utilityService.recordTelemetry(route, request, method.name(), statusCode, outcome, startedAt, correlationId);
                return response;
            } catch (Exception e) {
                log.error("Rate limiting error", e);
                statusCode = HttpStatus.SERVICE_UNAVAILABLE.value();
                ResponseEntity<byte[]> response = utilityService.error(HttpStatus.SERVICE_UNAVAILABLE, "Rate limiting is temporarily unavailable", correlationId, null);
                utilityService.recordTelemetry(route, request, method.name(), statusCode, outcome, startedAt, correlationId);
                return response;
            }

            HttpHeaders policyHeaders = rateLimitingService.rateLimitHeaders(rateLimit);

            if (!rateLimit.allowed()) {
                outcome = "RATE_LIMITED";
                statusCode = HttpStatus.TOO_MANY_REQUESTS.value();
                policyHeaders.set(HttpHeaders.RETRY_AFTER, String.valueOf(rateLimit.retryAfterSeconds()));
                ResponseEntity<byte[]> response = utilityService.error(HttpStatus.TOO_MANY_REQUESTS, "Rate limit exceeded", correlationId, policyHeaders);
                utilityService.recordTelemetry(route, request, method.name(), statusCode, outcome, startedAt, correlationId);
                return response;
            }

            byte[] requestBody;
            try {
                requestBody = request.getInputStream().readAllBytes();
            } catch (Exception e) {
                statusCode = HttpStatus.BAD_REQUEST.value();
                outcome = "BAD_REQUEST";
                ResponseEntity<byte[]> response = utilityService.error(HttpStatus.BAD_REQUEST, "Failed to read request body", correlationId, null);
                utilityService.recordTelemetry(route, request, method.name(), statusCode, outcome, startedAt, correlationId);
                return response;
            }

            // Idempotency check
            String idempotencyKey = null;
            String bodyHash = null;
            if (route.idempotencyEnabled() && (method == HttpMethod.POST || method == HttpMethod.PUT || method == HttpMethod.PATCH)) {
                idempotencyKey = idempotencyService.extractKey(request);
                if (idempotencyKey == null) {
                    statusCode = HttpStatus.BAD_REQUEST.value();
                    outcome = "IDEMPOTENCY_KEY_MISSING";
                    ResponseEntity<byte[]> response = utilityService.error(HttpStatus.BAD_REQUEST, "Idempotency-Key header is required for this route", correlationId, null);
                    utilityService.recordTelemetry(route, request, method.name(), statusCode, outcome, startedAt, correlationId);
                    return response;
                }
                bodyHash = idempotencyService.hashBody(requestBody);

                long responseTimeOutMs = route.responseTimeoutMs() == null ? 5000 : route.responseTimeoutMs();
                Optional<IdempotencyRecord> existing = idempotencyService.checkAndLock(route, idempotencyKey, bodyHash, responseTimeOutMs);
                if (existing.isPresent()) {
                    IdempotencyRecord record = existing.get();
                    if (record.status() == IdempotencyStatus.IN_PROGRESS) {
                        statusCode = HttpStatus.CONFLICT.value();
                        outcome = "IDEMPOTENCY_IN_PROGRESS";
                        ResponseEntity<byte[]> response = utilityService.error(HttpStatus.CONFLICT, "Concurrent request with the same idempotency key is already in progress", correlationId, null);
                        utilityService.recordTelemetry(route, request, method.name(), statusCode, outcome, startedAt, correlationId);
                        return response;
                    }
                    if (!record.requestBodyHash().equals(bodyHash)) {
                        statusCode = HttpStatus.CONFLICT.value();
                        outcome = "IDEMPOTENCY_CONFLICT";
                        ResponseEntity<byte[]> response = utilityService.error(HttpStatus.CONFLICT, "Idempotency key reused with a different request payload", correlationId, null);
                        utilityService.recordTelemetry(route, request, method.name(), statusCode, outcome, startedAt, correlationId);
                        return response;
                    }

                    HttpHeaders cachedHeaders = new HttpHeaders();
                    record.responseHeaders().forEach(cachedHeaders::addAll);
                    statusCode = record.responseStatus();
                    outcome = "IDEMPOTENCY_CACHE_HIT";
                    ResponseEntity<byte[]> response = ResponseEntity
                            .status(statusCode)
                            .headers(cachedHeaders)
                            .body(record.responseBody());
                    utilityService.recordTelemetry(route, request, method.name(), statusCode, outcome, startedAt, correlationId);
                    return response;
                }
            }

            // Request header rules
            HttpHeaders upstreamHeaders = new HttpHeaders();
            Collections.list(request.getHeaderNames()).forEach(headerName -> {
                Collections.list(request.getHeaders(headerName)).forEach(val -> {
                    upstreamHeaders.add(headerName, val);
                });
            });
            headerTransformationService.applyRules(upstreamHeaders, route.headerRules(), HeaderDirection.REQUEST);

            String targetUrl = utilityService.buildTargetUrl(route, request);
            HttpEntity<byte[]> upstreamEntity = new HttpEntity<>(requestBody, upstreamHeaders);

            // Response timeout
            int timeoutMs = route.responseTimeoutMs() != null ? route.responseTimeoutMs() : 5000;
            SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
            requestFactory.setConnectTimeout(5000);
            requestFactory.setReadTimeout(timeoutMs);

            RestTemplate routeRestTemplate = new RestTemplate(requestFactory);
            routeRestTemplate.setErrorHandler(response -> false);

            // Forwarding request
            ResponseEntity<byte[]> upstreamResponse = routeRestTemplate.exchange(
                    targetUrl,
                    org.springframework.http.HttpMethod.valueOf(method.toString()),
                    upstreamEntity,
                    byte[].class
            );

            // Response header rules
            HttpHeaders responseHeaders = new HttpHeaders();
            responseHeaders.putAll(upstreamResponse.getHeaders());
            headerTransformationService.applyRules(responseHeaders, route.headerRules(), HeaderDirection.RESPONSE);
            responseHeaders.set("X-Correlation-ID", correlationId);

            byte[] responseBody = upstreamResponse.getBody() == null ? new byte[0] : upstreamResponse.getBody();
            statusCode = upstreamResponse.getStatusCode().value();
            outcome = "SUCCESS";

            if (idempotencyKey != null && bodyHash != null) {
                idempotencyService.saveCompletedResponse(
                        route,
                        idempotencyKey,
                        bodyHash,
                        statusCode,
                        responseBody,
                        responseHeaders
                );
            }

            ResponseEntity<byte[]> response = ResponseEntity
                    .status(statusCode)
                    .headers(responseHeaders)
                    .body(responseBody);

            utilityService.recordTelemetry(route, request, method.name(), statusCode, outcome, startedAt, correlationId);
            return response;

        } catch (Exception e) {
            log.error("Failed to proxy request to target upstream for route {}", route != null ? route.routeId() : "UNKNOWN", e);
            statusCode = HttpStatus.BAD_GATEWAY.value();
            outcome = "TARGET_ERROR";
            ResponseEntity<byte[]> response = utilityService.error(HttpStatus.BAD_GATEWAY, "Gateway upstream communication failed: " + e.getMessage(), correlationId, null);
            utilityService.recordTelemetry(route, request, method != null ? method.name() : request.getMethod(), statusCode, outcome, startedAt, correlationId);
            return response;
        }
    }
}