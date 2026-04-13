package com.opspilot.platform.dto;

import java.time.Instant;
import java.time.LocalDate;

public class TaskResponse {

    private Long id;
    private String title;
    private String description;
    private String status;
    private String priority;
    private LocalDate dueDate;
    private String assignedToEmail;
    private Long incidentId;
    private String incidentTitle;
    private Instant createdAt;

    public TaskResponse() {
    }

    public TaskResponse(Long id,
                        String title,
                        String description,
                        String status,
                        String priority,
                        LocalDate dueDate,
                        String assignedToEmail,
                        Long incidentId,
                        String incidentTitle,
                        Instant createdAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.dueDate = dueDate;
        this.assignedToEmail = assignedToEmail;
        this.incidentId = incidentId;
        this.incidentTitle = incidentTitle;
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

    public String getPriority() {
        return priority;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public String getAssignedToEmail() {
        return assignedToEmail;
    }

    public Long getIncidentId() {
        return incidentId;
    }

    public String getIncidentTitle() {
        return incidentTitle;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}