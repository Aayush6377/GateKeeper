package in.gatekeeper.gateway.modal;

import lombok.Builder;

@Builder
public record RateLimitResult(
        boolean allowed,
        long limit,
        long remaining,
        long retryAfterSeconds
) {
    public static RateLimitResult skipped(){
        return RateLimitResult.builder()
                .allowed(true)
                .limit(0)
                .remaining(0)
                .retryAfterSeconds(0)
                .build();
    }
}
