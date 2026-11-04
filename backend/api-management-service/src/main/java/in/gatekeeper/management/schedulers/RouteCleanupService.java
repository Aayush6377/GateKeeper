package in.gatekeeper.management.schedulers;

import in.gatekeeper.management.entity.ApiRoute;
import in.gatekeeper.management.enums.RouteStatus;
import in.gatekeeper.management.repository.ApiRouteRepository;
import in.gatekeeper.management.repository.RouteConfigurationVersionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RouteCleanupService {
    private final ApiRouteRepository apiRouteRepository;
    private final RouteConfigurationVersionRepository versionRepository;

    @Value("${app.routes.retention-days:7}")
    private long retentionDays;

    @Scheduled(fixedDelayString = "${app.routes.cleanup-interval:3600000}")
    @Transactional
    public void permanentlyDeleteExpiredRoutes(){
        Instant cutoff = Instant.now().minus(retentionDays, ChronoUnit.DAYS);

        List<ApiRoute> expiredRoutes = apiRouteRepository.findExpiredRoutes(cutoff, PageRequest.of(0, 100));

        if (expiredRoutes.isEmpty()){
            return;
        }

        List<UUID> routeIds = expiredRoutes.stream()
                .map(ApiRoute::getId)
                .toList();

        versionRepository.deleteAllByRouteIds(routeIds);
        apiRouteRepository.deleteAll(expiredRoutes);

        log.info("Permanently deleted {} expired routes", expiredRoutes.size());
    }
}
