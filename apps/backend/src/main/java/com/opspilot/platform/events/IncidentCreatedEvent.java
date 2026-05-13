package com.opspilot.platform.events;

import java.time.Instant;

public class IncidentCreatedEvent {

    private Long incidentId;
    private String title;
    private String description;
    private String severity;
    private String status;
    private String ownerEmail;
    private String impactedService;
    private Instant createdAt;

    public IncidentCreatedEvent() {
    }

    public IncidentCreatedEvent(Long incidentId, String title, String description,
                                String severity, String status, String ownerEmail,
                                String impactedService, Instant createdAt) {
        this.incidentId = incidentId;
        this.title = title;
        this.description = description;
        this.severity = severity;
        this.status = status;
        this.ownerEmail = ownerEmail;
        this.impactedService = impactedService;
        this.createdAt = createdAt;
    }

    public Long getIncidentId() { return incidentId; }
    public void setIncidentId(Long incidentId) { this.incidentId = incidentId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getOwnerEmail() { return ownerEmail; }
    public void setOwnerEmail(String ownerEmail) { this.ownerEmail = ownerEmail; }

    public String getImpactedService() { return impactedService; }
    public void setImpactedService(String impactedService) { this.impactedService = impactedService; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}