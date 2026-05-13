package com.opspilot.platform.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateTeamRequest {

    @NotBlank(message = "Team name is required")
    private String name;

    public CreateTeamRequest() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}