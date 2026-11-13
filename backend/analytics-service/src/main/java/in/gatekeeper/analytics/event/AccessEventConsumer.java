package in.gatekeeper.analytics.event;

import in.gatekeeper.analytics.document.RouteAggregateDocument;
import in.gatekeeper.analytics.dto.requestDto.AccessEventPayload;
import in.gatekeeper.analytics.repository.RouteAggregateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Component
@RequiredArgsConstructor
@Slf4j
public class AccessEventConsumer {

    private final ObjectMapper objectMapper;
    private final RouteAggregateRepository routeAggregateRepository;

    @KafkaListener(
            topics = "${gateway.kafka.access-events-topic}",
            groupId = "${gateway.kafka.access-events-group}"
    )
    public void consume(ConsumerRecord<String, String> record, Acknowledgment acknowledgment){
        try{
            String event = record.value();

            AccessEventPayload payload = objectMapper.readValue(event, AccessEventPayload.class);

            if (payload == null){
                log.warn("Received null payload from Kafka partition {}", record.partition());
                acknowledgment.acknowledge();
                return;
            }

            updateRouteAggregate(payload);

            log.debug("Successfully processed access event for path: {}", payload.requestPath());

        } catch (JacksonException e){
            log.error("Unable to parse the event {}", record.key(), e);
        } catch (Exception e) {
            log.error("Error processing access event record from Kafka offset {}: {}", record.offset(), e.getMessage(), e);
        } finally {
            acknowledgment.acknowledge();
        }
    }

    private void updateRouteAggregate(AccessEventPayload payload) {
        if (payload.routeId() == null || "UNKNOWN".equals(payload.routeId())){
            return;
        }

        Instant eventTime = payload.timestamp() != null ? payload.timestamp() : Instant.now();
        Instant hourBucket = eventTime.truncatedTo(ChronoUnit.HOURS);

        RouteAggregateDocument aggregate = routeAggregateRepository.findByRouteIdAndHourBucket(payload.routeId(), hourBucket)
                .orElseGet(() -> RouteAggregateDocument.builder()
                        .organizationId(payload.organizationId())
                        .routeId(payload.routeId())
                        .routeName(payload.routeName())
                        .hourBucket(hourBucket)
                        .totalRequests(0)
                        .successCount(0)
                        .errorCount(0)
                        .avgLatencyMs(0.0)
                        .build()
        );

        long newTotal = aggregate.getTotalRequests() + 1;
        boolean isSuccess = payload.statusCode() >= 200 && payload.statusCode() < 400;

        long newSuccessCount = aggregate.getSuccessCount() + (isSuccess ? 1 : 0);
        long newErrorCount = aggregate.getErrorCount() + (isSuccess ? 0 : 1);

        double newAvgLatency = ((aggregate.getAvgLatencyMs() * aggregate.getTotalRequests()) + payload.latencyMs()) / newTotal;

        aggregate.setTotalRequests(newTotal);
        aggregate.setSuccessCount(newSuccessCount);
        aggregate.setErrorCount(newErrorCount);
        aggregate.setAvgLatencyMs(newAvgLatency);

        routeAggregateRepository.save(aggregate);
    }
}
