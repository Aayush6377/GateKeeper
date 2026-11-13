package in.gatekeeper.gateway.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {
    @Bean
    public NewTopic gatewayConfigurationTopic(
            @Value("${gateway-kafka-configuration-topic}") String topic
    ){
        return TopicBuilder.name(topic)
                .partitions(2)
                .replicas(1)
                .build();
    }

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
