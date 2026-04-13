package com.opspilot.platform.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateIncidentRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @NotBlank
    private String severity;

    @NotBlank
    private String impactedService;

    @NotBlank
    private String ownerEmail;

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

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getImpactedService() {
        return impactedService;
    }

    public void setImpactedService(String impactedService) {
        this.impactedService = impactedService;
    }

    public String getOwnerEmail() {
        return ownerEmail;
    }

    public void setOwnerEmail(String ownerEmail) {
        this.ownerEmail = ownerEmail;
    }
}