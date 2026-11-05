package in.gatekeeper.management.dto.responseDto;

import lombok.Builder;

import java.util.UUID;

@Builder
public record LoginResponse(
        String accessToken,
        String refreshToken,
        long expiresInSeconds
) { }
