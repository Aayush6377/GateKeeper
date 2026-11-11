package in.gatekeeper.management.schedulers;

import in.gatekeeper.management.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Component
@RequiredArgsConstructor
public class RefreshTokenCleanupTask {

    private final RefreshTokenRepository refreshTokenRepository;

    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void purgeExpiredTokens(){
        refreshTokenRepository.deleteByExpiryDateBefore(Instant.now());
    }
}
