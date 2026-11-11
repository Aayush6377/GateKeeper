package in.gatekeeper.gateway.dto.responseDto;

public record LoginResponse(
        String accessToken,
        String refreshToken,
        long expiresInSeconds
) {
}
