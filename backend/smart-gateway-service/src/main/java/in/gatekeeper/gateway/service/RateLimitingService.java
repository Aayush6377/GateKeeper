package in.gatekeeper.gateway.service;

import in.gatekeeper.gateway.dto.responseDto.GatewayRoute;
import in.gatekeeper.gateway.exception.GatewayPolicyException;
import in.gatekeeper.gateway.modal.RateLimitResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class RateLimitingService {
    private static final Long WINDOW_SECONDS = 60L;

    private final StringRedisTemplate redisTemplate;
    private final DefaultRedisScript<List> rateLimitScript;

    public RateLimitResult check(GatewayRoute route, String clientIp) {
       if (route.requestsPerMinute() == null){
           return RateLimitResult.skipped();
       }

       String key = String.format(
               "gateway:rate_limit:%s:%s:%s",
               route.organizationId(),
               route.routeId(),
               clientIp.replace(":", "_")
       );

       List<?> result;

       try {
           result = redisTemplate.execute(
                   rateLimitScript,
                   Collections.singletonList(key),
                   String.valueOf(route.requestsPerMinute()),
                   String.valueOf(WINDOW_SECONDS)
           );
       } catch (DataAccessException e){
           log.error("Error", e);
           throw unavailable();
       }

        if (result == null) {
            log.error("Rate limit script returned null. Key: {}", key);
            throw unavailable();
        }

        if (result.size() != 3) {
            log.error("Unexpected rate limit script result. Size: {}, Result: {}",
                    result.size(), result);
            throw unavailable();
        }

       long current = ((Number) result.get(0)).longValue();
       long remaining = ((Number) result.get(1)).longValue();
       long ttl = ((Number) result.get(2)).longValue();

       boolean allowed = current <= route.requestsPerMinute();

       return RateLimitResult.builder()
               .allowed(allowed)
               .limit(route.requestsPerMinute())
               .remaining(remaining)
               .retryAfterSeconds(Math.max(ttl, 1))
               .build();
    }

    public HttpHeaders rateLimitHeaders(RateLimitResult result) {
        HttpHeaders headers = new HttpHeaders();
        if (result.limit() > 0){
            headers.set("X-RateLimit-Limit", String.valueOf(result.limit()));
            headers.set("X-RateLimit-Remaining", String.valueOf(result.remaining()));
        }

        return headers;
    }

    private GatewayPolicyException unavailable() {
        return new GatewayPolicyException(
                HttpStatus.SERVICE_UNAVAILABLE,
                "Rate limiting is temporarily unavailable",
                "POLICY_UNAVAILABLE"
        );
    }
}
