package com.opspilot.platform.dto;

import java.time.Instant;

public class IncidentResponse {

    private Long id;
    private String title;
    private String description;
    private String severity;
    private String status;
    private String impactedService;
    private String ownerEmail;
    private Instant createdAt;

    public IncidentResponse() {
    }

    public IncidentResponse(Long id,
                            String title,
                            String description,
                            String severity,
                            String status,
                            String impactedService,
                            String ownerEmail,
                            Instant createdAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.severity = severity;
        this.status = status;
        this.impactedService = impactedService;
        this.ownerEmail = ownerEmail;
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

    public String getSeverity() {
        return severity;
    }

    public String getStatus() {
        return status;
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