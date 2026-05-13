package com.opspilot.platform.events;

import java.time.Instant;

public class CommentCreatedEvent {

    private Long commentId;
    private String entityType;
    private Long entityId;
    private String authorEmail;
    private String content;
    private Instant createdAt;

    public CommentCreatedEvent() {}

    public CommentCreatedEvent(Long commentId,
                               String entityType,
                               Long entityId,
                               String authorEmail,
                               String content,
                               Instant createdAt) {
        this.commentId = commentId;
        this.entityType = entityType;
        this.entityId = entityId;
        this.authorEmail = authorEmail;
        this.content = content;
        this.createdAt = createdAt;
    }

    public Long getCommentId() { return commentId; }
    public String getEntityType() { return entityType; }
    public Long getEntityId() { return entityId; }
    public String getAuthorEmail() { return authorEmail; }
    public String getContent() { return content; }
    public Instant getCreatedAt() { return createdAt; }
}