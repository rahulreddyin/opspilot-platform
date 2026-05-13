package com.opspilot.platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class PromoteUserRoleRequest {

    @NotNull(message = "User id is required")
    private Long userId;

    @NotBlank(message = "Role is required")
    private String role;

    public PromoteUserRoleRequest() {
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}