package in.gatekeeper.management.controller;

import in.gatekeeper.management.dto.responseDto.HealthResponse;
import in.gatekeeper.management.service.HealthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/health")
@RequiredArgsConstructor
public class HealthController {

    private final HealthService healthService;

    @GetMapping
    public ResponseEntity<HealthResponse> health(){
        return ResponseEntity.ok(healthService.getHealth());
    }
}
