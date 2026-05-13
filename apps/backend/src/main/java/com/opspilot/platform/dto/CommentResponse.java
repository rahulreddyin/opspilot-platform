package com.opspilot.platform.dto;

import java.time.Instant;

public class CommentResponse {

    private Long id;
    private String entityType;
    private Long entityId;
    private String authorEmail;
    private String content;
    private Instant createdAt;

    public CommentResponse(Long id,
                           String entityType,
                           Long entityId,
                           String authorEmail,
                           String content,
                           Instant createdAt) {
        this.id = id;
        this.entityType = entityType;
        this.entityId = entityId;
        this.authorEmail = authorEmail;
        this.content = content;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getEntityType() {
        return entityType;
    }

    public Long getEntityId() {
        return entityId;
    }

    public String getAuthorEmail() {
        return authorEmail;
    }

    public String getContent() {
        return content;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}