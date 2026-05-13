package com.opspilot.platform.dto;

public class TeamResponse {

    private Long id;
    private String name;

    public TeamResponse() {
    }

    public TeamResponse(Long id, String name) {
        this.id = id;
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }
}