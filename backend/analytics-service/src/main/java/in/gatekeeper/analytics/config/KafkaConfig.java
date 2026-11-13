package in.gatekeeper.analytics.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {
    @Bean
    public NewTopic gatewayAccessEventTopic(
            @Value("${gateway.kafka.access-events-topic}") String topic
    ){
        return TopicBuilder.name(topic)
                .partitions(2)
                .replicas(1)
                .build();
    }
}
