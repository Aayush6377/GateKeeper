package in.gatekeeper.gateway.event;

import in.gatekeeper.gateway.modal.AccessEventPayload;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

@Service
@Slf4j
@RequiredArgsConstructor
public class AccessEventProducer {
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Value("${gateway.kafka.access-events-topic}")
    private String accessEventsTopic;

    public void sendAccessEvent(AccessEventPayload event){
        String key = event.correlationId() != null ? event.correlationId() : "default-key";

        try{
            String eventPayload = objectMapper.writeValueAsString(event);

            kafkaTemplate.send(accessEventsTopic, key, eventPayload).whenComplete((result, ex) -> {
                if (ex != null) {
                    log.error("Failed to publish access event for path {}: {}", event.requestPath(), ex.getMessage(), ex);
                }
            });

        } catch (JacksonException e) {
            log.warn("Unable to parse event {}", event.routeId(), e);
        }
    }
}
