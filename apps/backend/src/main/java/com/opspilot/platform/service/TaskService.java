package com.opspilot.platform.service;

import com.opspilot.platform.domain.Incident;
import com.opspilot.platform.domain.Task;
import com.opspilot.platform.domain.TaskPriority;
import com.opspilot.platform.domain.User;
import com.opspilot.platform.dto.CreateTaskRequest;
import com.opspilot.platform.dto.TaskResponse;
import com.opspilot.platform.repository.IncidentRepository;
import com.opspilot.platform.repository.TaskRepository;
import com.opspilot.platform.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final IncidentRepository incidentRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    public TaskService(
            TaskRepository taskRepository,
            IncidentRepository incidentRepository,
            UserRepository userRepository,
            AuditLogService auditLogService,
            NotificationService notificationService
    ) {
        this.taskRepository = taskRepository;
        this.incidentRepository = incidentRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
        this.notificationService = notificationService;
    }

    public TaskResponse createTask(CreateTaskRequest request, String currentUserEmail) {
        User actingUser = getUser(currentUserEmail);

        String assignedToEmail = normalizeEmail(request.getAssignedToEmail());

        if (!userRepository.existsByEmailIgnoreCase(assignedToEmail)) {
            throw new RuntimeException("Assigned user not found");
        }

        Incident incident = incidentRepository.findById(request.getIncidentId())
                .orElseThrow(() -> new RuntimeException("Incident not found"));

        Task task = new Task();
        task.setTitle(request.getTitle().trim());
        task.setDescription(request.getDescription().trim());
        task.setStatus("OPEN");
        task.setPriority(TaskPriority.valueOf(request.getPriority()));
        task.setAssignedToEmail(assignedToEmail);
        task.setDueDate(request.getDueDate());
        task.setIncident(incident);
        task.setCreatedAt(Instant.now());

        Task savedTask = taskRepository.save(task);

        auditLogService.logTaskCreated(actingUser, savedTask);

        notificationService.createNotification(
                assignedToEmail,
                "New task assigned",
                "You have been assigned a new task: " + savedTask.getTitle(),
                "TASK",
                "TASK",
                savedTask.getId()
        );

        return mapToResponse(savedTask);
    }

    public List<TaskResponse> createBulkTasks(List<CreateTaskRequest> requests, String currentUserEmail) {
        return requests.stream()
                .map(request -> createTask(request, currentUserEmail))
                .toList();
    }

    public List<TaskResponse> getMyTasks(String currentUserEmail) {
        String email = normalizeEmail(currentUserEmail);

        return taskRepository.findByAssignedToEmail(email)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public TaskResponse updateTask(Long taskId, CreateTaskRequest request, String currentUserEmail) {
        User actingUser = getUser(currentUserEmail);

        Task task = getTaskEntityById(taskId);
        Task before = copyTask(task);

        Incident incident = incidentRepository.findById(request.getIncidentId())
                .orElseThrow(() -> new RuntimeException("Incident not found"));

        String assignedToEmail = normalizeEmail(request.getAssignedToEmail());

        if (!userRepository.existsByEmailIgnoreCase(assignedToEmail)) {
            throw new RuntimeException("Assigned user not found");
        }

        String oldAssignedTo = task.getAssignedToEmail();

        task.setTitle(request.getTitle().trim());
        task.setDescription(request.getDescription().trim());
        task.setPriority(TaskPriority.valueOf(request.getPriority()));
        task.setAssignedToEmail(assignedToEmail);
        task.setDueDate(request.getDueDate());
        task.setIncident(incident);

        Task updatedTask = taskRepository.save(task);

        auditLogService.logTaskUpdated(actingUser, before, updatedTask);

        if (oldAssignedTo == null || !oldAssignedTo.equalsIgnoreCase(assignedToEmail)) {
            notificationService.createNotification(
                    assignedToEmail,
                    "Task reassigned",
                    "A task has been assigned to you: " + updatedTask.getTitle(),
                    "TASK",
                    "TASK",
                    updatedTask.getId()
            );
        }

        return mapToResponse(updatedTask);
    }

    public TaskResponse updateTaskStatus(Long taskId, String newStatus, String currentUserEmail) {
        User actingUser = getUser(currentUserEmail);

        Task task = getTaskEntityById(taskId);
        Task before = copyTask(task);

        task.setStatus(newStatus);

        Task updatedTask = taskRepository.save(task);

        auditLogService.logTaskStatusUpdated(actingUser, before, updatedTask);

        return mapToResponse(updatedTask);
    }

    public void deleteTask(Long taskId, String currentUserEmail) {
        User actingUser = getUser(currentUserEmail);

        Task task = getTaskEntityById(taskId);

        auditLogService.logTaskDeleted(actingUser, task);

        taskRepository.delete(task);
    }

    public Task getTaskEntityById(Long taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
    }

    private User getUser(String email) {
        return userRepository.findByEmailIgnoreCase(normalizeEmail(email))
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private TaskResponse mapToResponse(Task task) {
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

    private Task copyTask(Task task) {
        Task copy = new Task();
        copy.setId(task.getId());
        copy.setTitle(task.getTitle());
        copy.setDescription(task.getDescription());
        copy.setStatus(task.getStatus());
        copy.setPriority(task.getPriority());
        copy.setDueDate(task.getDueDate());
        copy.setAssignedToEmail(task.getAssignedToEmail());
        copy.setIncident(task.getIncident());
        copy.setCreatedAt(task.getCreatedAt());
        return copy;
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }
}