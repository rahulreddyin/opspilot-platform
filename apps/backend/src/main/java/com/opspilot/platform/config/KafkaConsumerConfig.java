package com.opspilot.platform.config;

import com.opspilot.platform.events.ActivityEvent;
import com.opspilot.platform.events.CommentCreatedEvent;
import com.opspilot.platform.events.IncidentCreatedEvent;
import com.opspilot.platform.events.IncidentStatusUpdatedEvent;
import com.opspilot.platform.events.TaskCreatedEvent;
import com.opspilot.platform.events.TaskStatusUpdatedEvent;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.support.serializer.JsonDeserializer;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaConsumerConfig {

    private Map<String, Object> baseConsumerConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "kafka:29092");
        config.put(ConsumerConfig.GROUP_ID_CONFIG, "opspilot-group");
        config.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        config.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        return config;
    }

    @Bean
    public ConsumerFactory<String, IncidentCreatedEvent> incidentCreatedConsumerFactory() {
        JsonDeserializer<IncidentCreatedEvent> deserializer =
                new JsonDeserializer<>(IncidentCreatedEvent.class);
        deserializer.trustedPackages("com.opspilot.platform.events");

        return new DefaultKafkaConsumerFactory<>(
                baseConsumerConfig(),
                new StringDeserializer(),
                deserializer
        );
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, IncidentCreatedEvent> incidentCreatedKafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, IncidentCreatedEvent> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(incidentCreatedConsumerFactory());
        return factory;
    }

    @Bean
    public ConsumerFactory<String, IncidentStatusUpdatedEvent> incidentStatusUpdatedConsumerFactory() {
        JsonDeserializer<IncidentStatusUpdatedEvent> deserializer =
                new JsonDeserializer<>(IncidentStatusUpdatedEvent.class);
        deserializer.trustedPackages("com.opspilot.platform.events");

        return new DefaultKafkaConsumerFactory<>(
                baseConsumerConfig(),
                new StringDeserializer(),
                deserializer
        );
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, IncidentStatusUpdatedEvent> incidentStatusUpdatedKafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, IncidentStatusUpdatedEvent> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(incidentStatusUpdatedConsumerFactory());
        return factory;
    }

    @Bean
    public ConsumerFactory<String, TaskCreatedEvent> taskCreatedConsumerFactory() {
        JsonDeserializer<TaskCreatedEvent> deserializer =
                new JsonDeserializer<>(TaskCreatedEvent.class);
        deserializer.trustedPackages("com.opspilot.platform.events");

        return new DefaultKafkaConsumerFactory<>(
                baseConsumerConfig(),
                new StringDeserializer(),
                deserializer
        );
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, TaskCreatedEvent> taskCreatedKafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, TaskCreatedEvent> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(taskCreatedConsumerFactory());
        return factory;
    }

    @Bean
    public ConsumerFactory<String, TaskStatusUpdatedEvent> taskStatusUpdatedConsumerFactory() {
        JsonDeserializer<TaskStatusUpdatedEvent> deserializer =
                new JsonDeserializer<>(TaskStatusUpdatedEvent.class);
        deserializer.trustedPackages("com.opspilot.platform.events");

        return new DefaultKafkaConsumerFactory<>(
                baseConsumerConfig(),
                new StringDeserializer(),
                deserializer
        );
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, TaskStatusUpdatedEvent> taskStatusUpdatedKafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, TaskStatusUpdatedEvent> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(taskStatusUpdatedConsumerFactory());
        return factory;
    }

    @Bean
    public ConsumerFactory<String, ActivityEvent> activityEventConsumerFactory() {
        JsonDeserializer<ActivityEvent> deserializer =
                new JsonDeserializer<>(ActivityEvent.class);
        deserializer.trustedPackages("com.opspilot.platform.events");

        return new DefaultKafkaConsumerFactory<>(
                baseConsumerConfig(),
                new StringDeserializer(),
                deserializer
        );
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, ActivityEvent> activityEventKafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, ActivityEvent> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(activityEventConsumerFactory());
        return factory;
    }

    @Bean
    public ConsumerFactory<String, CommentCreatedEvent> commentCreatedConsumerFactory() {
        JsonDeserializer<CommentCreatedEvent> deserializer =
                new JsonDeserializer<>(CommentCreatedEvent.class);
        deserializer.trustedPackages("com.opspilot.platform.events");

        return new DefaultKafkaConsumerFactory<>(
                baseConsumerConfig(),
                new StringDeserializer(),
                deserializer
        );
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, CommentCreatedEvent> commentCreatedKafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, CommentCreatedEvent> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(commentCreatedConsumerFactory());
        return factory;
    }
}