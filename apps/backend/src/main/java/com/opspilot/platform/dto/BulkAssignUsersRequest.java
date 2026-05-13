package com.opspilot.platform.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public class BulkAssignUsersRequest {

    @NotNull(message = "Team ID is required")
    private Long teamId;

    @NotNull(message = "User IDs are required")
    @Size(min = 1, message = "Select at least one user")
    private List<Long> userIds;

    public BulkAssignUsersRequest() {
    }

    public Long getTeamId() {
        return teamId;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }

    public List<Long> getUserIds() {
        return userIds;
    }

    public void setUserIds(List<Long> userIds) {
        this.userIds = userIds;
    }
}