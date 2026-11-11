package in.gatekeeper.gateway.service;

import in.gatekeeper.gateway.dto.responseDto.GatewayRoute;
import in.gatekeeper.gateway.enums.IdempotencyStatus;
import in.gatekeeper.gateway.modal.IdempotencyRecord;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

import java.security.MessageDigest;
import java.time.Duration;
import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class IdempotencyService {
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    private static final Duration IDEMPOTENCY_TTL = Duration.ofHours(2);

    public String extractKey(HttpServletRequest request){
        String key = request.getHeader("Idempotency-Key");
        if (key == null || key.trim().isEmpty()){
            key = request.getHeader("X-Idempotency-Key");
        }

        return key == null ? null : key.trim();
    }

    public String hashBody(byte[] body){
        try{
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(body);
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            log.error("Failed to hash request body for idempotency", e);
            return String.valueOf(Arrays.hashCode(body));
        }
    }

    public Optional<IdempotencyRecord> checkAndLock(GatewayRoute route, String idempotencyKey, String bodyHash, long timeoutMs){
        String redisKey = buildRedisKey(route, idempotencyKey);
        String existingJson = redisTemplate.opsForValue().get(redisKey);

        if (existingJson != null){
            try{
                IdempotencyRecord record = objectMapper.readValue(existingJson, IdempotencyRecord.class);

                // completed record
                if (record.status() == IdempotencyStatus.COMPLETED){
                    return Optional.of(record);
                }

                // progress record
                long maxAllowedDuration = Math.max(timeoutMs + 5000, 30000);
                if (System.currentTimeMillis() - record.createdAt() > maxAllowedDuration) {
                    log.warn("Found stale IN_PROGRESS idempotency lock for key {}. Overwriting.", idempotencyKey);
                } else {
                    return Optional.of(record);
                }

            } catch (Exception e) {
                log.error("Failed to parse idempotency record from Redis", e);
            }
        }

        try{
            IdempotencyRecord newRecord = IdempotencyRecord.builder()
                    .status(IdempotencyStatus.IN_PROGRESS)
                    .requestBodyHash(bodyHash)
                    .responseBody(null)
                    .responseStatus(0)
                    .responseHeaders(null)
                    .createdAt(System.currentTimeMillis())
                    .build();

            redisTemplate.opsForValue().set(redisKey, objectMapper.writeValueAsString(newRecord), IDEMPOTENCY_TTL);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        return Optional.empty();
    }

    public void saveCompletedResponse(
            GatewayRoute route,
            String idempotencyKey,
            String bodyHash,
            int status,
            byte[] body,
            HttpHeaders headers
    ){
        String redisKey = buildRedisKey(route, idempotencyKey);
        try{
            Map<String, List<String>> responseHeader = new HashMap<>();

            if (headers != null){
                headers.forEach(responseHeader::put);
            }

            IdempotencyRecord completedRecord = IdempotencyRecord.builder()
                    .status(IdempotencyStatus.COMPLETED)
                    .requestBodyHash(bodyHash)
                    .responseBody(body)
                    .responseStatus(status)
                    .responseHeaders(responseHeader)
                    .createdAt(System.currentTimeMillis())
                    .build();

            redisTemplate.opsForValue().set(redisKey, objectMapper.writeValueAsString(completedRecord),IDEMPOTENCY_TTL);

        } catch (Exception e) {
            log.error("Failed to save completed idempotency response to Redis", e);
        }
    }

    private String buildRedisKey(GatewayRoute route, String idempotencyKey) {
        return String.format("gateway:idempotency:%s:%s:%s", route.organizationId(), route.routeId(), idempotencyKey);
    }
}
