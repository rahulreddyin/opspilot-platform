package com.opspilot.platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public class BulkPromoteUserRoleRequest {

    @NotNull(message = "User IDs are required")
    @Size(min = 1, message = "Select at least one user")
    private List<Long> userIds;

    @NotBlank(message = "Role is required")
    private String role;

    public BulkPromoteUserRoleRequest() {
    }

    public List<Long> getUserIds() {
        return userIds;
    }

    public void setUserIds(List<Long> userIds) {
        this.userIds = userIds;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}