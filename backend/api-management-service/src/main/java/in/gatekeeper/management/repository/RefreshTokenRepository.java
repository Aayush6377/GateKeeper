package in.gatekeeper.management.repository;

import in.gatekeeper.management.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByToken(String refreshToken);

    void deleteByExpiryDateBefore(Instant now);
}
