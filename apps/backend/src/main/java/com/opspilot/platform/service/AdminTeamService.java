package com.opspilot.platform.service;

import com.opspilot.platform.domain.Incident;
import com.opspilot.platform.domain.Role;
import com.opspilot.platform.domain.Task;
import com.opspilot.platform.domain.Team;
import com.opspilot.platform.domain.User;
import com.opspilot.platform.dto.AdminTeamDetailsResponse;
import com.opspilot.platform.dto.AdminUserPerformanceResponse;
import com.opspilot.platform.dto.CreateTeamRequest;
import com.opspilot.platform.dto.TeamResponse;
import com.opspilot.platform.dto.UserSummaryResponse;
import com.opspilot.platform.repository.IncidentRepository;
import com.opspilot.platform.repository.TaskRepository;
import com.opspilot.platform.repository.TeamRepository;
import com.opspilot.platform.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class AdminTeamService {

    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final IncidentRepository incidentRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    public AdminTeamService(TeamRepository teamRepository,
                            UserRepository userRepository,
                            TaskRepository taskRepository,
                            IncidentRepository incidentRepository,
                            AuditLogService auditLogService,
                            NotificationService notificationService) {
        this.teamRepository = teamRepository;
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
        this.incidentRepository = incidentRepository;
        this.auditLogService = auditLogService;
        this.notificationService = notificationService;
    }

    @Transactional
    public TeamResponse createTeam(CreateTeamRequest request) {
        String teamName = request.getName().trim();

        if (teamRepository.existsByNameIgnoreCase(teamName)) {
            throw new IllegalArgumentException("A team with this name already exists");
        }

        Team team = new Team();
        team.setName(teamName);

        Team saved = teamRepository.save(team);
        auditLogService.logTeamCreated(saved);

        notifyCurrentUser(
                "Team created",
                "Team \"" + saved.getName() + "\" was created successfully.",
                "TEAM_CREATED",
                "TEAM",
                saved.getId()
        );

        return new TeamResponse(saved.getId(), saved.getName());
    }

    public List<TeamResponse> getAllTeams() {
        return teamRepository.findAll()
                .stream()
                .map(team -> new TeamResponse(team.getId(), team.getName()))
                .toList();
    }

    public AdminTeamDetailsResponse getTeamDetails(Long teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        List<User> members = userRepository.findByTeam_Id(teamId);

        List<String> emails = members.stream()
                .map(User::getEmail)
                .filter(email -> email != null && !email.isBlank())
                .toList();

        long openTasks = countTasksByStatus(emails, "OPEN");
        long inProgressTasks = countTasksByStatus(emails, "IN_PROGRESS");
        long doneTasks = countTasksByStatus(emails, "DONE");

        long openIncidents = emails.isEmpty()
                ? 0
                : incidentRepository.findByOwnerEmailIn(emails)
                .stream()
                .filter(incident -> incident.getStatus() != null)
                .filter(incident -> !"RESOLVED".equalsIgnoreCase(incident.getStatus()))
                .count();

        List<UserSummaryResponse> users = members.stream()
                .map(user -> mapUser(user))
                .toList();

        return new AdminTeamDetailsResponse(
                team.getId(),
                team.getName(),
                users,
                openTasks,
                inProgressTasks,
                doneTasks,
                openIncidents
        );
    }

    public List<UserSummaryResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::mapUser)
                .toList();
    }

    @Transactional
    public UserSummaryResponse assignUserToTeam(Long userId, Long teamId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        user.setTeam(team);
        User saved = userRepository.save(user);

        auditLogService.logUserAssignedToTeam(saved, team);

        String currentUserEmail = getCurrentUserEmail();
        boolean assignedSelf =
                currentUserEmail != null &&
                currentUserEmail.equalsIgnoreCase(saved.getEmail());

        if (!assignedSelf) {
            notifyCurrentUser(
                    "User assigned to team",
                    saved.getEmail() + " was assigned to " + team.getName() + ".",
                    "USER_ASSIGNED_TO_TEAM",
                    "USER",
                    saved.getId()
            );
        }

        notifyUser(
                saved.getEmail(),
                "You were assigned to a team",
                "You were assigned to " + team.getName() + ".",
                "USER_ASSIGNED_TO_TEAM",
                "USER",
                saved.getId()
        );

        return mapUser(saved);
    }

    public List<UserSummaryResponse> bulkAssignUsersToTeam(List<Long> userIds, Long teamId) {
        return userIds.stream()
                .map(userId -> assignUserToTeam(userId, teamId))
                .toList();
    }

    @Transactional
    public UserSummaryResponse removeUserFromTeam(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String oldTeamName = user.getTeam() != null ? user.getTeam().getName() : null;

        user.setTeam(null);
        User saved = userRepository.save(user);

        auditLogService.logUserRemovedFromTeam(saved, oldTeamName);

        String currentUserEmail = getCurrentUserEmail();
        boolean removedSelf =
                currentUserEmail != null &&
                currentUserEmail.equalsIgnoreCase(saved.getEmail());

        if (!removedSelf) {
            notifyCurrentUser(
                    "User removed from team",
                    saved.getEmail() + " was removed from " + (oldTeamName == null ? "their team" : oldTeamName) + ".",
                    "USER_REMOVED_FROM_TEAM",
                    "USER",
                    saved.getId()
            );
        }

        notifyUser(
                saved.getEmail(),
                "You were removed from a team",
                "You were removed from " + (oldTeamName == null ? "your team" : oldTeamName) + ".",
                "USER_REMOVED_FROM_TEAM",
                "USER",
                saved.getId()
        );

        return mapUser(saved);
    }

    @Transactional
    public void deleteTeam(Long teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        List<User> users = userRepository.findByTeam_Id(teamId);

        for (User user : users) {
            user.setTeam(null);

            notifyUser(
                    user.getEmail(),
                    "Team deleted",
                    "Your team \"" + team.getName() + "\" was deleted.",
                    "TEAM_DELETED",
                    "TEAM",
                    team.getId()
            );
        }

        userRepository.saveAll(users);
        teamRepository.delete(team);

        auditLogService.logTeamDeleted(team);

        notifyCurrentUser(
                "Team deleted",
                "Team \"" + team.getName() + "\" was deleted.",
                "TEAM_DELETED",
                "TEAM",
                team.getId()
        );
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        auditLogService.logUserDeleted(user);

        notifyCurrentUser(
                "User deleted",
                user.getEmail() + " was deleted from the platform.",
                "USER_DELETED",
                "USER",
                user.getId()
        );

        userRepository.delete(user);
    }

    @Transactional
    public UserSummaryResponse addRoleToUser(Long userId, Role role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Set<Role> roles = user.getRoles();

        if (roles == null) {
            roles = new HashSet<>();
        }

        boolean added = roles.add(role);
        user.setRoles(roles);

        User saved = userRepository.save(user);

        if (added) {
            auditLogService.logUserRoleAdded(saved, role);

            String currentUserEmail = getCurrentUserEmail();
            boolean updatedSelf =
                    currentUserEmail != null &&
                    currentUserEmail.equalsIgnoreCase(saved.getEmail());

            if (!updatedSelf) {
                notifyCurrentUser(
                        "User role updated",
                        role.name() + " role was added to " + saved.getEmail() + ".",
                        "USER_ROLE_ADDED",
                        "USER",
                        saved.getId()
                );
            }

            notifyUser(
                    saved.getEmail(),
                    "Your role was updated",
                    role.name() + " role was added to your account.",
                    "USER_ROLE_ADDED",
                    "USER",
                    saved.getId()
            );
        }

        return mapUser(saved);
    }


    @Transactional
public UserSummaryResponse removeRoleFromUser(Long userId, Role role) {
    if (role == Role.USER) {
        throw new IllegalArgumentException("USER role cannot be removed");
    }

    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

Set<Role> roles = user.getRoles() == null
        ? new HashSet<>()
        : new HashSet<>(user.getRoles());

if (!roles.contains(role)) {
    throw new IllegalArgumentException("User does not have this role");
}

    if (role == Role.ADMIN) {
        long adminCount = userRepository.findAll()
                .stream()
                .filter(existingUser ->
                        existingUser.getRoles() != null &&
                        existingUser.getRoles().contains(Role.ADMIN)
                )
                .count();

        if (adminCount <= 1) {
            throw new IllegalArgumentException("Cannot remove the last ADMIN role");
        }

        String currentUserEmail = getCurrentUserEmail();

        if (currentUserEmail != null && currentUserEmail.equalsIgnoreCase(user.getEmail())) {
            throw new IllegalArgumentException("You cannot remove your own ADMIN role");
        }
    }

    roles.remove(role);
    user.setRoles(roles);

    User saved = userRepository.save(user);

    String currentUserEmail = getCurrentUserEmail();
    boolean updatedSelf =
            currentUserEmail != null &&
            currentUserEmail.equalsIgnoreCase(saved.getEmail());

    if (!updatedSelf) {
        notifyCurrentUser(
                "User role removed",
                role.name() + " role was removed from " + saved.getEmail() + ".",
                "USER_ROLE_REMOVED",
                "USER",
                saved.getId()
        );
    }

    notifyUser(
            saved.getEmail(),
            "Your role was updated",
            role.name() + " role was removed from your account.",
            "USER_ROLE_REMOVED",
            "USER",
            saved.getId()
    );

    return mapUser(saved);
}

    public List<UserSummaryResponse> bulkAddRoleToUsers(List<Long> userIds, Role role) {
        return userIds.stream()
                .map(userId -> addRoleToUser(userId, role))
                .toList();
    }

    public AdminUserPerformanceResponse getUserPerformance(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String email = user.getEmail();

        List<Task> tasks = email == null || email.isBlank()
                ? List.of()
                : taskRepository.findByAssignedToEmail(email);

        List<Incident> incidents = email == null || email.isBlank()
                ? List.of()
                : incidentRepository.findByOwnerEmail(email);

        long totalTasks = tasks.size();

        long openTasks = tasks.stream()
                .filter(task -> task.getStatus() != null)
                .filter(task -> "OPEN".equalsIgnoreCase(task.getStatus()))
                .count();

        long inProgressTasks = tasks.stream()
                .filter(task -> task.getStatus() != null)
                .filter(task -> "IN_PROGRESS".equalsIgnoreCase(task.getStatus()))
                .count();

        long completedTasks = tasks.stream()
                .filter(task -> task.getStatus() != null)
                .filter(task -> "DONE".equalsIgnoreCase(task.getStatus()))
                .count();

        long overdueTasks = tasks.stream()
                .filter(task -> task.getDueDate() != null)
                .filter(task -> task.getStatus() == null || !"DONE".equalsIgnoreCase(task.getStatus()))
                .filter(task -> task.getDueDate().isBefore(LocalDate.now()))
                .count();

        long ownedIncidents = incidents.size();

        long activeIncidents = incidents.stream()
                .filter(incident -> incident.getStatus() != null)
                .filter(incident -> !"RESOLVED".equalsIgnoreCase(incident.getStatus()))
                .count();

        int completionRate = totalTasks == 0
                ? 0
                : (int) Math.round((completedTasks * 100.0) / totalTasks);

        int activeWorkloadRate = totalTasks == 0
                ? 0
                : (int) Math.round(((openTasks + inProgressTasks) * 100.0) / totalTasks);

        return new AdminUserPerformanceResponse(
                user.getId(),
                user.getName(),
                email,
                user.getTeam() != null ? user.getTeam().getName() : null,
                user.getRoles().stream().map(Enum::name).toList(),
                totalTasks,
                openTasks,
                inProgressTasks,
                completedTasks,
                overdueTasks,
                ownedIncidents,
                activeIncidents,
                completionRate,
                activeWorkloadRate
        );
    }

    private long countTasksByStatus(List<String> emails, String status) {
        if (emails == null || emails.isEmpty()) {
            return 0;
        }

        return taskRepository.findByAssignedToEmailIn(emails)
                .stream()
                .filter(task -> task.getStatus() != null)
                .filter(task -> status.equalsIgnoreCase(task.getStatus()))
                .count();
    }

    private void notifyCurrentUser(String title,
                                   String message,
                                   String type,
                                   String entityType,
                                   Long entityId) {
        String email = getCurrentUserEmail();

        if (email == null || email.isBlank()) {
            return;
        }

        notifyUser(email, title, message, type, entityType, entityId);
    }

    private void notifyUser(String userEmail,
                            String title,
                            String message,
                            String type,
                            String entityType,
                            Long entityId) {
        if (userEmail == null || userEmail.isBlank()) {
            return;
        }

        notificationService.createNotification(
                userEmail,
                title,
                message,
                type,
                entityType,
                entityId
        );
    }

    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getName() == null) {
            return null;
        }

        return authentication.getName();
    }

    private UserSummaryResponse mapUser(User user) {
        return new UserSummaryResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getTeam() != null ? user.getTeam().getId() : null,
                user.getTeam() != null ? user.getTeam().getName() : null,
                user.getRoles().stream().map(Enum::name).toList()
        );
    }
}