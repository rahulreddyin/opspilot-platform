package com.opspilot.platform.service;

import com.opspilot.platform.events.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class EventPublisherService {

    private final SimpMessagingTemplate messagingTemplate;

    public EventPublisherService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    // ================= INCIDENT EVENTS =================

    public void publishIncidentCreated(IncidentCreatedEvent event) {
        messagingTemplate.convertAndSend("/topic/incidents/created", event);

        publishActivityEvent(
                "INCIDENT_CREATED",
                "New incident: " + event.getTitle(),
                "INCIDENT",
                event.getIncidentId()
        );
    }

    public void publishIncidentStatusUpdated(IncidentStatusUpdatedEvent event) {
        messagingTemplate.convertAndSend("/topic/incidents/status-updated", event);

        publishActivityEvent(
                "INCIDENT_STATUS_UPDATED",
                "Incident updated: " + event.getTitle() + " → " + event.getStatus(),
                "INCIDENT",
                event.getIncidentId()
        );
    }

    // ================= TASK EVENTS =================

    public void publishTaskCreated(TaskCreatedEvent event) {
        messagingTemplate.convertAndSend("/topic/tasks/created", event);

        publishActivityEvent(
                "TASK_CREATED",
                "Task created: " + event.getTitle(),
                "TASK",
                event.getTaskId()
        );
    }

    public void publishTaskStatusUpdated(TaskStatusUpdatedEvent event) {
        messagingTemplate.convertAndSend("/topic/tasks/status-updated", event);

        publishActivityEvent(
                "TASK_STATUS_UPDATED",
                "Task updated: " + event.getTitle() + " → " + event.getStatus(),
                "TASK",
                event.getTaskId()
        );
    }

    // ================= COMMENT EVENTS =================

    public void publishCommentCreated(CommentCreatedEvent event) {
        messagingTemplate.convertAndSend("/topic/comments", event);

        publishActivityEvent(
                "COMMENT_CREATED",
                "New comment added",
                event.getEntityType(),
                event.getEntityId()
        );
    }

    // ================= ACTIVITY FEED =================

    public void publishActivityEvent(String type,
                                     String message,
                                     String entityType,
                                     Long entityId) {

        ActivityFeedEvent activity = new ActivityFeedEvent(
                type,
                message,
                entityType,
                entityId,
                Instant.now()
        );

        messagingTemplate.convertAndSend("/topic/activity", activity);
    }

    // ================= NOTIFICATIONS =================

    public void publishNotification(String email, Object payload) {
        if (email == null || email.isBlank()) return;

        messagingTemplate.convertAndSend(
                "/topic/notifications/" + email.toLowerCase(),
                payload
        );
    }
}