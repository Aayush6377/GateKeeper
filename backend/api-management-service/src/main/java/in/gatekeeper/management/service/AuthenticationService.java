package in.gatekeeper.management.service;

import in.gatekeeper.management.dto.requestDto.LoginRequest;
import in.gatekeeper.management.dto.requestDto.RefreshTokenRequest;
import in.gatekeeper.management.dto.responseDto.LoginResponse;
import in.gatekeeper.management.entity.ManagementUser;
import in.gatekeeper.management.entity.RefreshToken;
import in.gatekeeper.management.enums.OrganizationStatus;
import in.gatekeeper.management.repository.ManagementUserRepository;
import in.gatekeeper.management.repository.RefreshTokenRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final ManagementUserRepository managementUserRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtEncoder jwtEncoder;
    private final AuthenticationManager authenticationManager;

    @Value("${security.jwt.access-expiration-seconds:900}")
    private long accessExpirationSeconds;

    @Value("${security.jwt.refresh-expiration-seconds:604800}")
    private long refreshExpirationSeconds;

    @Transactional
    public LoginResponse login(LoginRequest request) {
        Authentication authentication;

        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.username(), request.password())
            );
        } catch (AuthenticationException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
        }

        ManagementUser user = managementUserRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password"));

        String accessToken = generateAccessToken(user);
        String refreshToken = createRefreshToken(user);

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresInSeconds(accessExpirationSeconds)
                .build();
    }

    @Transactional
    public LoginResponse refreshToken(RefreshTokenRequest request){
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.refreshToken())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token not found"));

        if (refreshToken.getExpiryDate().isBefore(Instant.now())){
            refreshTokenRepository.delete(refreshToken);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token expired. Please log in again.");
        }

        ManagementUser user = refreshToken.getUser();

        refreshTokenRepository.delete(refreshToken);
        String newAccessToken = generateAccessToken(user);
        String newRefreshToken = createRefreshToken(user);

        return LoginResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .expiresInSeconds(accessExpirationSeconds)
                .build();
    }

    @Transactional
    public void logout(RefreshTokenRequest request) {
        refreshTokenRepository.findByToken(request.refreshToken())
                .ifPresent(refreshTokenRepository::delete);
    }

    private String generateAccessToken(ManagementUser user) {

        Instant issuedAt = Instant.now();

        JwtClaimsSet.Builder claimBuilder = JwtClaimsSet.builder()
                .issuer("gatekeeper-api-management")
                .issuedAt(issuedAt)
                .subject(user.getUsername())
                .expiresAt(issuedAt.plusSeconds(accessExpirationSeconds))
                .claim("role", user.getRole().getName().name())
                .claim("userId", user.getId());

        if (user.getOrganization() != null){
            claimBuilder.claim("organizationId", user.getOrganization().getId());
        }

        JwtClaimsSet claims = claimBuilder.build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();

        return jwtEncoder.encode(
                JwtEncoderParameters.from(header, claims)
        ).getTokenValue();
    }

    private String createRefreshToken(ManagementUser user) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setExpiryDate(Instant.now().plusSeconds(refreshExpirationSeconds));
        refreshToken.setToken(UUID.randomUUID().toString());

        refreshTokenRepository.save(refreshToken);

        return refreshToken.getToken();
    }
}
