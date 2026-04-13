package com.opspilot.platform.events;

import java.time.Instant;

public class IncidentCreatedEvent {

    private Long incidentId;
    private String title;
    private String severity;
    private String impactedService;
    private String ownerEmail;
    private Instant createdAt;

    public IncidentCreatedEvent() {
    }

    public IncidentCreatedEvent(Long incidentId,
                                String title,
                                String severity,
                                String impactedService,
                                String ownerEmail,
                                Instant createdAt) {
        this.incidentId = incidentId;
        this.title = title;
        this.severity = severity;
        this.impactedService = impactedService;
        this.ownerEmail = ownerEmail;
        this.createdAt = createdAt;
    }

    public Long getIncidentId() {
        return incidentId;
    }

    public String getTitle() {
        return title;
    }

    public String getSeverity() {
        return severity;
    }

    public String getImpactedService() {
        return impactedService;
    }

    public String getOwnerEmail() {
        return ownerEmail;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}