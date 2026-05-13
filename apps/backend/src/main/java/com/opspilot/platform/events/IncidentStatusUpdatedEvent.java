package com.opspilot.platform.events;

public class IncidentStatusUpdatedEvent {

    private Long incidentId;
    private String title;
    private String status;

    public IncidentStatusUpdatedEvent() {
    }

    public IncidentStatusUpdatedEvent(Long incidentId, String title, String status) {
        this.incidentId = incidentId;
        this.title = title;
        this.status = status;
    }

    public Long getIncidentId() { return incidentId; }
    public void setIncidentId(Long incidentId) { this.incidentId = incidentId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}