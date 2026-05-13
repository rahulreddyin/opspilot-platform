package com.opspilot.platform.controller;

import com.opspilot.platform.domain.Role;
import com.opspilot.platform.dto.*;
import com.opspilot.platform.service.AdminTeamService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminTeamController {

    private final AdminTeamService adminTeamService;

    public AdminTeamController(AdminTeamService adminTeamService) {
        this.adminTeamService = adminTeamService;
    }

    @PostMapping("/teams")
    public TeamResponse createTeam(@Valid @RequestBody CreateTeamRequest request) {
        return adminTeamService.createTeam(request);
    }

    @GetMapping("/teams")
    public List<TeamResponse> getAllTeams() {
        return adminTeamService.getAllTeams();
    }

    @GetMapping("/teams/{teamId}")
    public AdminTeamDetailsResponse getTeamDetails(@PathVariable Long teamId) {
        return adminTeamService.getTeamDetails(teamId);
    }

    @DeleteMapping("/teams/{teamId}")
    public void deleteTeam(@PathVariable Long teamId) {
        adminTeamService.deleteTeam(teamId);
    }

    @GetMapping("/users")
    public List<UserSummaryResponse> getAllUsers() {
        return adminTeamService.getAllUsers();
    }

    @GetMapping("/users/{userId}/performance")
    public AdminUserPerformanceResponse getUserPerformance(@PathVariable Long userId) {
        return adminTeamService.getUserPerformance(userId);
    }

    @DeleteMapping("/users/{userId}")
    public void deleteUser(@PathVariable Long userId) {
        adminTeamService.deleteUser(userId);
    }

    @PatchMapping("/teams/users")
    public UserSummaryResponse assignUserToTeam(@Valid @RequestBody AssignUserToTeamRequest request) {
        return adminTeamService.assignUserToTeam(request.getUserId(), request.getTeamId());
    }

    @PatchMapping("/teams/users/bulk")
    public List<UserSummaryResponse> bulkAssignUsersToTeam(
            @Valid @RequestBody BulkAssignUsersRequest request
    ) {
        return adminTeamService.bulkAssignUsersToTeam(request.getUserIds(), request.getTeamId());
    }

    @PatchMapping("/teams/users/{userId}/remove")
    public UserSummaryResponse removeUserFromTeam(@PathVariable Long userId) {
        return adminTeamService.removeUserFromTeam(userId);
    }

    @PatchMapping("/users/roles")
    public UserSummaryResponse addRoleToUser(@Valid @RequestBody PromoteUserRoleRequest request) {
        return adminTeamService.addRoleToUser(
                request.getUserId(),
                Role.valueOf(request.getRole())
        );
    }


    @PatchMapping("/users/roles/remove")
public UserSummaryResponse removeRoleFromUser(@Valid @RequestBody PromoteUserRoleRequest request) {
    return adminTeamService.removeRoleFromUser(
            request.getUserId(),
            Role.valueOf(request.getRole())
    );
}

    @PatchMapping("/users/roles/bulk")
    public List<UserSummaryResponse> bulkAddRoleToUsers(
            @Valid @RequestBody BulkPromoteUserRoleRequest request
    ) {
        return adminTeamService.bulkAddRoleToUsers(
                request.getUserIds(),
                Role.valueOf(request.getRole())
        );
    }
}