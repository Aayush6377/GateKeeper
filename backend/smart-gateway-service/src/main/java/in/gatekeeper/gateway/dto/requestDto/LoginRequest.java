package in.gatekeeper.gateway.dto.requestDto;

public record LoginRequest(
        String username,
        String password
) { }
