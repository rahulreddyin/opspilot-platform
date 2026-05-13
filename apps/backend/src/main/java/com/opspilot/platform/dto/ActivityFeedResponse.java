package com.opspilot.platform.dto;

import java.time.Instant;

public class ActivityFeedResponse {

    private String action;
    private String message;
    private String entityType;
    private Long entityId;
    private String actorEmail;
    private Instant createdAt;

    public ActivityFeedResponse() {}

    public ActivityFeedResponse(String action,
                                String message,
                                String entityType,
                                Long entityId,
                                String actorEmail,
                                Instant createdAt) {
        this.action = action;
        this.message = message;
        this.entityType = entityType;
        this.entityId = entityId;
        this.actorEmail = actorEmail;
        this.createdAt = createdAt;
    }

    public String getAction() { return action; }
    public String getMessage() { return message; }
    public String getEntityType() { return entityType; }
    public Long getEntityId() { return entityId; }
    public String getActorEmail() { return actorEmail; }
    public Instant getCreatedAt() { return createdAt; }
}