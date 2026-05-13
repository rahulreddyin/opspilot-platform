package com.opspilot.platform.events;

import java.time.Instant;

public class ActivityEvent {

    private String type;
    private String message;
    private String actorEmail;
    private String entityType;
    private Long entityId;
    private Instant timestamp;

    public ActivityEvent() {
    }

    public ActivityEvent(String type,
                         String message,
                         String actorEmail,
                         String entityType,
                         Long entityId,
                         Instant timestamp) {
        this.type = type;
        this.message = message;
        this.actorEmail = actorEmail;
        this.entityType = entityType;
        this.entityId = entityId;
        this.timestamp = timestamp;
    }

    public String getType() {
        return type;
    }

    public String getMessage() {
        return message;
    }

    public String getActorEmail() {
        return actorEmail;
    }

    public String getEntityType() {
        return entityType;
    }

    public Long getEntityId() {
        return entityId;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setActorEmail(String actorEmail) {
        this.actorEmail = actorEmail;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public void setEntityId(Long entityId) {
        this.entityId = entityId;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}