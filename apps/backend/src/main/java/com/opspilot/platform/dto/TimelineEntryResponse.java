package com.opspilot.platform.dto;

import java.time.Instant;

public class TimelineEntryResponse {

    private String type;
    private String actorEmail;
    private String message;
    private Instant createdAt;

    public TimelineEntryResponse(String type,
                                 String actorEmail,
                                 String message,
                                 Instant createdAt) {
        this.type = type;
        this.actorEmail = actorEmail;
        this.message = message;
        this.createdAt = createdAt;
    }

    public String getType() {
        return type;
    }

    public String getActorEmail() {
        return actorEmail;
    }

    public String getMessage() {
        return message;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}