package com.opspilot.platform.service;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class EventConsumerService {

    @KafkaListener(topics = "task.created", groupId = "opspilot-group")
    public void handleTaskCreated(String message) {
        System.out.println("KAFKA EVENT RECEIVED [task.created]: " + message);
    }

    @KafkaListener(topics = "incident.created", groupId = "opspilot-group")
    public void handleIncidentCreated(String message) {
        System.out.println("KAFKA EVENT RECEIVED [incident.created]: " + message);
    }

    @KafkaListener(topics = "incident.status.updated", groupId = "opspilot-group")
    public void handleIncidentStatusUpdated(String message) {
        System.out.println("KAFKA EVENT RECEIVED [incident.status.updated]: " + message);
    }
}