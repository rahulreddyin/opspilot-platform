package com.opspilot.platform.dto;

import java.util.List;

public record TeamWorkspaceResponse(
        Long teamId,
        String teamName,
        List<UserSummaryResponse> members,
        List<TaskResponse> tasks,
        long totalTasks,
        long openTasks,
        long inProgressTasks,
        long doneTasks
) {
}