package com.opspilot.platform.dto;

import java.util.List;

public class AdminUserPerformanceResponse {

    private Long userId;
    private String userName;
    private String email;
    private String teamName;
    private List<String> roles;

    private long totalTasks;
    private long openTasks;
    private long inProgressTasks;
    private long completedTasks;
    private long overdueTasks;
    private long ownedIncidents;
    private long activeIncidents;

    private int completionRate;
    private int activeWorkloadRate;

    public AdminUserPerformanceResponse() {
    }

    public AdminUserPerformanceResponse(Long userId,
                                        String userName,
                                        String email,
                                        String teamName,
                                        List<String> roles,
                                        long totalTasks,
                                        long openTasks,
                                        long inProgressTasks,
                                        long completedTasks,
                                        long overdueTasks,
                                        long ownedIncidents,
                                        long activeIncidents,
                                        int completionRate,
                                        int activeWorkloadRate) {
        this.userId = userId;
        this.userName = userName;
        this.email = email;
        this.teamName = teamName;
        this.roles = roles;
        this.totalTasks = totalTasks;
        this.openTasks = openTasks;
        this.inProgressTasks = inProgressTasks;
        this.completedTasks = completedTasks;
        this.overdueTasks = overdueTasks;
        this.ownedIncidents = ownedIncidents;
        this.activeIncidents = activeIncidents;
        this.completionRate = completionRate;
        this.activeWorkloadRate = activeWorkloadRate;
    }

    public Long getUserId() { return userId; }
    public String getUserName() { return userName; }
    public String getName() { return userName; }
    public String getEmail() { return email; }
    public String getTeamName() { return teamName; }
    public List<String> getRoles() { return roles; }
    public long getTotalTasks() { return totalTasks; }
    public long getOpenTasks() { return openTasks; }
    public long getInProgressTasks() { return inProgressTasks; }
    public long getCompletedTasks() { return completedTasks; }
    public long getDoneTasks() { return completedTasks; }
    public long getOverdueTasks() { return overdueTasks; }
    public long getOwnedIncidents() { return ownedIncidents; }
    public long getTotalIncidents() { return ownedIncidents; }
    public long getActiveIncidents() { return activeIncidents; }
    public int getCompletionRate() { return completionRate; }
    public int getActiveWorkloadRate() { return activeWorkloadRate; }

    public void setUserId(Long userId) { this.userId = userId; }
    public void setUserName(String userName) { this.userName = userName; }
    public void setEmail(String email) { this.email = email; }
    public void setTeamName(String teamName) { this.teamName = teamName; }
    public void setRoles(List<String> roles) { this.roles = roles; }
    public void setTotalTasks(long totalTasks) { this.totalTasks = totalTasks; }
    public void setOpenTasks(long openTasks) { this.openTasks = openTasks; }
    public void setInProgressTasks(long inProgressTasks) { this.inProgressTasks = inProgressTasks; }
    public void setCompletedTasks(long completedTasks) { this.completedTasks = completedTasks; }
    public void setOverdueTasks(long overdueTasks) { this.overdueTasks = overdueTasks; }
    public void setOwnedIncidents(long ownedIncidents) { this.ownedIncidents = ownedIncidents; }
    public void setActiveIncidents(long activeIncidents) { this.activeIncidents = activeIncidents; }
    public void setCompletionRate(int completionRate) { this.completionRate = completionRate; }
    public void setActiveWorkloadRate(int activeWorkloadRate) { this.activeWorkloadRate = activeWorkloadRate; }
}