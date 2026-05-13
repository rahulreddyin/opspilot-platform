package com.opspilot.platform.controller;

import com.opspilot.platform.dto.CreateTaskRequest;
import com.opspilot.platform.dto.TaskResponse;
import com.opspilot.platform.dto.TeamWorkspaceResponse;
import com.opspilot.platform.service.TeamWorkspaceService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/team-workspace")
@PreAuthorize("hasAnyRole('TEAM_LEAD', 'ADMIN')")
public class TeamWorkspaceController {

    private final TeamWorkspaceService teamWorkspaceService;

    public TeamWorkspaceController(TeamWorkspaceService teamWorkspaceService) {
        this.teamWorkspaceService = teamWorkspaceService;
    }

    @GetMapping
    public TeamWorkspaceResponse getMyTeamWorkspace(Authentication authentication) {
        return teamWorkspaceService.getMyTeamWorkspace(authentication.getName());
    }

    @PostMapping("/tasks")
    public TaskResponse createTaskForTeamMember(@Valid @RequestBody CreateTaskRequest request,
                                                Authentication authentication) {
        return teamWorkspaceService.createTaskForTeamMember(request, authentication.getName());
    }
}