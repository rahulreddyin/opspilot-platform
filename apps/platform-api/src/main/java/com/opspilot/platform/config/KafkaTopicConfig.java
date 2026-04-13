package com.opspilot.platform.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KafkaTopicConfig {

    @Bean
    public NewTopic taskCreatedTopic() {
        return new NewTopic("task.created", 1, (short) 1);
    }

    @Bean
    public NewTopic incidentCreatedTopic() {
        return new NewTopic("incident.created", 1, (short) 1);
    }

    @Bean
    public NewTopic incidentStatusUpdatedTopic() {
        return new NewTopic("incident.status.updated", 1, (short) 1);
    }
}