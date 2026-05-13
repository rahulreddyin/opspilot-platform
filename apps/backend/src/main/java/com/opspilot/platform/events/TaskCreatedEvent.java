package com.opspilot.platform.events;

import java.time.Instant;

public class TaskCreatedEvent {

    private Long taskId;
    private String title;
    private String description;
    private String status;
    private String priority;
    private String assignedToEmail;
    private Long incidentId;
    private Instant createdAt;

    public TaskCreatedEvent() {
    }

    public TaskCreatedEvent(Long taskId,
                            String title,
                            String description,
                            String status,
                            String priority,
                            String assignedToEmail,
                            Long incidentId,
                            Instant createdAt) {
        this.taskId = taskId;
        this.title = title;
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.assignedToEmail = assignedToEmail;
        this.incidentId = incidentId;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getAssignedToEmail() {
        return assignedToEmail;
    }

    public void setAssignedToEmail(String assignedToEmail) {
        this.assignedToEmail = assignedToEmail;
    }

    public Long getIncidentId() {
        return incidentId;
    }

    public void setIncidentId(Long incidentId) {
        this.incidentId = incidentId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}