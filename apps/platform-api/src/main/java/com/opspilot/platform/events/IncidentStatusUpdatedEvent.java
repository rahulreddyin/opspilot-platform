package com.opspilot.platform.events;

import java.time.Instant;

public class IncidentStatusUpdatedEvent {

    private Long incidentId;
    private String status;
    private Instant updatedAt;

    public IncidentStatusUpdatedEvent() {
    }

    public IncidentStatusUpdatedEvent(Long incidentId, String status, Instant updatedAt) {
        this.incidentId = incidentId;
        this.status = status;
        this.updatedAt = updatedAt;
    }

    public Long getIncidentId() {
        return incidentId;
    }

    public String getStatus() {
        return status;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}