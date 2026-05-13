package com.opspilot.platform.dto;

import java.util.List;

public class AdminTeamDetailsResponse {

    private Long id;
    private String name;
    private List<UserSummaryResponse> users;
    private long openTasks;
    private long inProgressTasks;
    private long doneTasks;
    private long openIncidents;

    public AdminTeamDetailsResponse() {
    }

    public AdminTeamDetailsResponse(Long id, String name,
                                    List<UserSummaryResponse> users,
                                    long openTasks,
                                    long inProgressTasks,
                                    long doneTasks,
                                    long openIncidents) {
        this.id = id;
        this.name = name;
        this.users = users;
        this.openTasks = openTasks;
        this.inProgressTasks = inProgressTasks;
        this.doneTasks = doneTasks;
        this.openIncidents = openIncidents;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public List<UserSummaryResponse> getUsers() {
        return users;
    }

    public long getOpenTasks() {
        return openTasks;
    }

    public long getInProgressTasks() {
        return inProgressTasks;
    }

    public long getDoneTasks() {
        return doneTasks;
    }

    public long getOpenIncidents() {
        return openIncidents;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setUsers(List<UserSummaryResponse> users) {
        this.users = users;
    }

    public void setOpenTasks(long openTasks) {
        this.openTasks = openTasks;
    }

    public void setInProgressTasks(long inProgressTasks) {
        this.inProgressTasks = inProgressTasks;
    }

    public void setDoneTasks(long doneTasks) {
        this.doneTasks = doneTasks;
    }

    public void setOpenIncidents(long openIncidents) {
        this.openIncidents = openIncidents;
    }
}