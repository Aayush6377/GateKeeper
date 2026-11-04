package in.gatekeeper.gateway.controller;

import in.gatekeeper.gateway.dto.responseDto.HealthResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/health")
public class HealthController {

    @Value("${info.app.name}")
    private String serviceName;

    @Value("${info.app.description}")
    private String serviceDescription;

    @GetMapping
    public ResponseEntity<HealthResponse> health(){
        return ResponseEntity.ok(HealthResponse.builder()
                .serviceName(serviceName)
                .serviceDescription(serviceDescription)
                .appStatus("UP")
                .build()
        );
    }
}
