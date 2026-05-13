package com.opspilot.platform.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdateIncidentStatusRequest {

    @NotBlank(message = "Status is required")
    private String status;

    public UpdateIncidentStatusRequest() {
    }

    public UpdateIncidentStatusRequest(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}