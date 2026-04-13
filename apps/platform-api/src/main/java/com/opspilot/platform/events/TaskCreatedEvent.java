package com.opspilot.platform.events;

import java.time.Instant;

public class TaskCreatedEvent {

    private Long taskId;
    private String title;
    private String description;
    private String assignedToEmail;
    private String priority;
    private Instant createdAt;

    public TaskCreatedEvent() {
    }

    public TaskCreatedEvent(Long taskId,
                            String title,
                            String description,
                            String assignedToEmail,
                            String priority,
                            Instant createdAt) {
        this.taskId = taskId;
        this.title = title;
        this.description = description;
        this.assignedToEmail = assignedToEmail;
        this.priority = priority;
        this.createdAt = createdAt;
    }

    public Long getTaskId() {
        return taskId;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getAssignedToEmail() {
        return assignedToEmail;
    }

    public void setAssignedToEmail(String assignedToEmail) {
        this.assignedToEmail = assignedToEmail;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}