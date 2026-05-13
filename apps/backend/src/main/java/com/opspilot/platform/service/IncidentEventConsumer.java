package com.opspilot.platform.service;

import com.opspilot.platform.events.IncidentCreatedEvent;
import com.opspilot.platform.events.IncidentStatusUpdatedEvent;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class IncidentEventConsumer {

    private final SimpMessagingTemplate messagingTemplate;

    public IncidentEventConsumer(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @KafkaListener(topics = "incident-created", groupId = "opspilot-group", containerFactory = "incidentCreatedKafkaListenerContainerFactory")
    public void handleIncidentCreated(IncidentCreatedEvent event) {
        messagingTemplate.convertAndSend("/topic/incidents/created", event);
    }

    @KafkaListener(topics = "incident-status-updated", groupId = "opspilot-group", containerFactory = "incidentStatusUpdatedKafkaListenerContainerFactory")
    public void handleIncidentStatusUpdated(IncidentStatusUpdatedEvent event) {
        messagingTemplate.convertAndSend("/topic/incidents/status-updated", event);
    }
}