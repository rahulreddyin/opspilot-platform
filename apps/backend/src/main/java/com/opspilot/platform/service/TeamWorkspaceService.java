package com.opspilot.platform.service;

import com.opspilot.platform.domain.Task;
import com.opspilot.platform.domain.Team;
import com.opspilot.platform.domain.User;
import com.opspilot.platform.dto.CreateTaskRequest;
import com.opspilot.platform.dto.TaskResponse;
import com.opspilot.platform.dto.TeamWorkspaceResponse;
import com.opspilot.platform.dto.UserSummaryResponse;
import com.opspilot.platform.repository.TaskRepository;
import com.opspilot.platform.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TeamWorkspaceService {

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final TaskService taskService;

    public TeamWorkspaceService(UserRepository userRepository,
                                TaskRepository taskRepository,
                                TaskService taskService) {
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
        this.taskService = taskService;
    }

    public TeamWorkspaceResponse getMyTeamWorkspace(String currentUserEmail) {
        User currentUser = getCurrentUser(currentUserEmail);
        Team team = getUserTeam(currentUser);

        List<User> members = userRepository.findByTeam_Id(team.getId());

        List<String> memberEmails = members.stream()
                .map(User::getEmail)
                .filter(email -> email != null && !email.isBlank())
                .map(String::toLowerCase)
                .toList();

        List<TaskResponse> tasks = memberEmails.isEmpty()
                ? List.of()
                : taskRepository.findByAssignedToEmailIn(memberEmails)
                .stream()
                .map(this::mapTaskToResponse)
                .toList();

long openTasks = tasks.stream()
        .filter(task -> "OPEN".equalsIgnoreCase(task.getStatus()))
        .count();

long inProgressTasks = tasks.stream()
        .filter(task -> "IN_PROGRESS".equalsIgnoreCase(task.getStatus()))
        .count();

long doneTasks = tasks.stream()
        .filter(task -> "DONE".equalsIgnoreCase(task.getStatus()))
        .count();

        List<UserSummaryResponse> memberResponses = members.stream()
                .map(user -> mapUser(user))
                .toList();

        return new TeamWorkspaceResponse(
                team.getId(),
                team.getName(),
                memberResponses,
                tasks,
                tasks.size(),
                openTasks,
                inProgressTasks,
                doneTasks
        );
    }

    public TaskResponse createTaskForTeamMember(CreateTaskRequest request, String currentUserEmail) {
        User currentUser = getCurrentUser(currentUserEmail);
        Team team = getUserTeam(currentUser);

        String assignedToEmail = normalizeEmail(request.getAssignedToEmail());

        User assignedUser = userRepository.findByEmailIgnoreCase(assignedToEmail)
                .orElseThrow(() -> new IllegalArgumentException("Assigned user not found"));

        if (assignedUser.getTeam() == null || !assignedUser.getTeam().getId().equals(team.getId())) {
            throw new IllegalArgumentException("Team leads can only assign tasks to users in their own team");
        }

        return taskService.createTask(request, currentUserEmail);
    }

    private User getCurrentUser(String currentUserEmail) {
        return userRepository.findByEmailIgnoreCase(normalizeEmail(currentUserEmail))
                .orElseThrow(() -> new IllegalArgumentException("Current user not found"));
    }

    private Team getUserTeam(User user) {
        if (user.getTeam() == null) {
            throw new IllegalArgumentException("You are not assigned to a team");
        }

        return user.getTeam();
    }

    private TaskResponse mapTaskToResponse(Task task) {
        Long incidentId = task.getIncident() != null ? task.getIncident().getId() : null;
        String incidentTitle = task.getIncident() != null ? task.getIncident().getTitle() : null;

        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getPriority() != null ? task.getPriority().name() : null,
                task.getDueDate(),
                task.getAssignedToEmail(),
                incidentId,
                incidentTitle,
                task.getCreatedAt()
        );
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

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }
}