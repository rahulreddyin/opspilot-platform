package com.opspilot.platform.events;

import java.time.Instant;

public class ActivityFeedEvent {

    private String type;
    private String message;
    private String entityType;
    private Long entityId;
    private Instant timestamp;

    public ActivityFeedEvent() {
    }

    public ActivityFeedEvent(String type, String message, String entityType, Long entityId, Instant timestamp) {
        this.type = type;
        this.message = message;
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

    public String getEntityType() {
        return entityType;
    }

    public Long getEntityId() {
        return entityId;
    }

    public Instant getTimestamp() {
        return timestamp;
    }
}