package com.opspilot.platform.dto;

import jakarta.validation.constraints.NotNull;

public class AssignUserToTeamRequest {

    @NotNull(message = "User id is required")
    private Long userId;

    @NotNull(message = "Team id is required")
    private Long teamId;

    public AssignUserToTeamRequest() {
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getTeamId() {
        return teamId;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }
}