package in.gatekeeper.management.events;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

@Component
@RequiredArgsConstructor
@Slf4j
public class GatewayConfigurationKafkaPublisher {
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Value("${gateway-kafka-configuration-topic}")
    private String topic;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void publish(GatewayConfigurationChangeEvent event){
        String key = event.organizationId().toString();

        try{
            kafkaTemplate.send(topic, key, objectMapper.writeValueAsString(event))
                    .whenComplete((result, exception) -> {
                        if (exception != null) {
                            log.error(
                                    "Failed to publish gateway configuration event. EventId: {}, OrganizationId: {}",
                                    event.eventId(),
                                    event.organizationId(),
                                    exception
                            );
                        }
                    });

        } catch (JacksonException e) {
            log.error(
                    "Failed to serialize gateway configuration event. EventId: {}",
                    event.eventId(),
                    e
            );
        }
    }
}
