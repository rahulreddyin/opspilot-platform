package com.opspilot.platform.dto;

import java.time.Instant;

public class AuditLogResponse {

    private Long id;
    private Long actorUserId;
    private String actorEmail;
    private String action;
    private String entityType;
    private Long entityId;
    private String oldValueJson;
    private String newValueJson;
    private Instant createdAt;

    public AuditLogResponse(Long id,
                            Long actorUserId,
                            String actorEmail,
                            String action,
                            String entityType,
                            Long entityId,
                            String oldValueJson,
                            String newValueJson,
                            Instant createdAt) {
        this.id = id;
        this.actorUserId = actorUserId;
        this.actorEmail = actorEmail;
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.oldValueJson = oldValueJson;
        this.newValueJson = newValueJson;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public Long getActorUserId() {
        return actorUserId;
    }

    public String getActorEmail() {
        return actorEmail;
    }

    public String getAction() {
        return action;
    }

    public String getEntityType() {
        return entityType;
    }

    public Long getEntityId() {
        return entityId;
    }

    public String getOldValueJson() {
        return oldValueJson;
    }

    public String getNewValueJson() {
        return newValueJson;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}