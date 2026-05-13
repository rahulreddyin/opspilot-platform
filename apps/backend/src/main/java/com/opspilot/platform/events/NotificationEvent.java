package com.opspilot.platform.events;

import java.time.Instant;

public class NotificationEvent {

    private Long id;
    private String userEmail;
    private String title;
    private String message;
    private String type;
    private String entityType;
    private Long entityId;
    private boolean read;
    private Instant createdAt;

    public NotificationEvent() {
    }

    public NotificationEvent(Long id,
                             String userEmail,
                             String title,
                             String message,
                             String type,
                             String entityType,
                             Long entityId,
                             boolean read,
                             Instant createdAt) {
        this.id = id;
        this.userEmail = userEmail;
        this.title = title;
        this.message = message;
        this.type = type;
        this.entityType = entityType;
        this.entityId = entityId;
        this.read = read;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public String getTitle() {
        return title;
    }

    public String getMessage() {
        return message;
    }

    public String getType() {
        return type;
    }

    public String getEntityType() {
        return entityType;
    }

    public Long getEntityId() {
        return entityId;
    }

    public boolean isRead() {
        return read;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public void setEntityId(Long entityId) {
        this.entityId = entityId;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}