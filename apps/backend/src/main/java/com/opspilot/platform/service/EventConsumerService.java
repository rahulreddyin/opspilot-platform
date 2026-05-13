package com.opspilot.platform.service;

import com.opspilot.platform.events.ActivityEvent;
import com.opspilot.platform.events.CommentCreatedEvent;
import com.opspilot.platform.events.IncidentCreatedEvent;
import com.opspilot.platform.events.IncidentStatusUpdatedEvent;
import com.opspilot.platform.events.TaskCreatedEvent;
import com.opspilot.platform.events.TaskStatusUpdatedEvent;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class EventConsumerService {

    private final SimpMessagingTemplate messagingTemplate;

    public EventConsumerService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @KafkaListener(
            topics = "incident-created",
            groupId = "opspilot-group",
            containerFactory = "incidentCreatedKafkaListenerContainerFactory"
    )
    public void handleIncidentCreated(IncidentCreatedEvent event) {
        messagingTemplate.convertAndSend("/topic/incidents/created", event);
    }

    @KafkaListener(
            topics = "incident-status-updated",
            groupId = "opspilot-group",
            containerFactory = "incidentStatusUpdatedKafkaListenerContainerFactory"
    )
    public void handleIncidentStatusUpdated(IncidentStatusUpdatedEvent event) {
        messagingTemplate.convertAndSend("/topic/incidents/status-updated", event);
    }

    @KafkaListener(
            topics = "task-created",
            groupId = "opspilot-group",
            containerFactory = "taskCreatedKafkaListenerContainerFactory"
    )
    public void handleTaskCreated(TaskCreatedEvent event) {
        messagingTemplate.convertAndSend("/topic/tasks/created", event);
    }

    @KafkaListener(
            topics = "task-status-updated",
            groupId = "opspilot-group",
            containerFactory = "taskStatusUpdatedKafkaListenerContainerFactory"
    )
    public void handleTaskStatusUpdated(TaskStatusUpdatedEvent event) {
        messagingTemplate.convertAndSend("/topic/tasks/status-updated", event);
    }

    @KafkaListener(
            topics = "activity-events",
            groupId = "opspilot-group",
            containerFactory = "activityEventKafkaListenerContainerFactory"
    )
    public void handleActivityEvent(ActivityEvent event) {
        messagingTemplate.convertAndSend("/topic/activity", event);
    }

    @KafkaListener(
            topics = "comment-created",
            groupId = "opspilot-group",
            containerFactory = "commentCreatedKafkaListenerContainerFactory"
    )
    public void handleCommentCreated(CommentCreatedEvent event) {
        messagingTemplate.convertAndSend(
                "/topic/comments/" + event.getEntityType() + "/" + event.getEntityId(),
                event
        );
    }
}