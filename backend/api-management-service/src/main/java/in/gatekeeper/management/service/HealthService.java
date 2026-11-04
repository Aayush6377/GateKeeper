package in.gatekeeper.management.service;

import in.gatekeeper.management.dto.responseDto.HealthResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class HealthService {
    @Value("${info.app.name}")
    private String serviceName;

    @Value("${info.app.description}")
    private String serviceDescription;

    private final JdbcTemplate jdbcTemplate;

    public HealthResponse getHealth() {
        String databaseStatus = "DOWN";

        try{
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);

            if (Integer.valueOf(1).equals(result)){
                databaseStatus = "UP";
            }
        }
        catch (Exception e){
            log.info("Database Health check failed {}", e.getMessage());
        }

        return HealthResponse.builder()
                .serviceName(serviceName)
                .serviceDescription(serviceDescription)
                .appStatus("UP")
                .databaseStatus(databaseStatus)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
