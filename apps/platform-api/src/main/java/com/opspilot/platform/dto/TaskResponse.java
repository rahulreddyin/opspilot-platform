package com.opspilot.platform.dto;

import java.time.Instant;

public class TaskResponse {

    private Long id;
    private String title;
    private String description;
    private String status;
    private String assignedToEmail;
    private Instant createdAt;

    public TaskResponse(Long id, String title, String description, String status, String assignedToEmail, Instant createdAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.status = status;
        this.assignedToEmail = assignedToEmail;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getStatus() {
        return status;
    }

    public String getAssignedToEmail() {
        return assignedToEmail;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}