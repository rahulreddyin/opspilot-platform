package com.opspilot.platform.dto;

import java.util.List;

public class UserSummaryResponse {

    private Long id;
    private String name;
    private String email;
    private Long teamId;
    private String teamName;
    private List<String> roles;

    public UserSummaryResponse() {
    }

    public UserSummaryResponse(Long id, String name, String email,
                               Long teamId, String teamName,
                               List<String> roles) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.teamId = teamId;
        this.teamName = teamName;
        this.roles = roles;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public Long getTeamId() {
        return teamId;
    }

    public String getTeamName() {
        return teamName;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }
}