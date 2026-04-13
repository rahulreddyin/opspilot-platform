package com.opspilot.platform.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.opspilot.platform.events.TaskCreatedEvent;
import com.opspilot.platform.events.IncidentCreatedEvent;
import com.opspilot.platform.events.IncidentStatusUpdatedEvent;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class EventPublisherService {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public EventPublisherService(KafkaTemplate<String, String> kafkaTemplate,
                                 ObjectMapper objectMapper) {
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
    }

    public void publishTaskCreated(TaskCreatedEvent event) {
        sendSafe("task.created", String.valueOf(event.getTaskId()), event);
    }

    public void publishIncidentCreated(IncidentCreatedEvent event) {
        sendSafe("incident.created", String.valueOf(event.getIncidentId()), event);
    }

    public void publishIncidentStatusUpdated(IncidentStatusUpdatedEvent event) {
        sendSafe("incident.status.updated", String.valueOf(event.getIncidentId()), event);
    }

    private void sendSafe(String topic, String key, Object event) {
        try {
            String payload = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(topic, key, payload);
        } catch (Exception e) {
            // IMPORTANT: do NOT crash API
            System.err.println("Kafka publish failed: " + e.getMessage());
        }
    }
}