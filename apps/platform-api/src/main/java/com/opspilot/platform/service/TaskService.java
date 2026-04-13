package com.opspilot.platform.service;

import com.opspilot.platform.domain.Incident;
import com.opspilot.platform.domain.Task;
import com.opspilot.platform.dto.CreateTaskRequest;
import com.opspilot.platform.dto.TaskResponse;
import com.opspilot.platform.events.TaskCreatedEvent;
import com.opspilot.platform.repository.IncidentRepository;
import com.opspilot.platform.repository.TaskRepository;
import com.opspilot.platform.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final IncidentRepository incidentRepository;
    private final EventPublisherService eventPublisherService;

    public TaskService(TaskRepository taskRepository,
                       UserRepository userRepository,
                       IncidentRepository incidentRepository,
                       EventPublisherService eventPublisherService) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.incidentRepository = incidentRepository;
        this.eventPublisherService = eventPublisherService;
    }

    public TaskResponse createTask(CreateTaskRequest request) {
        if (!userRepository.existsByEmail(request.getAssignedToEmail())) {
            throw new IllegalArgumentException("Assigned user not found");
        }

        Incident incident = null;
        if (request.getIncidentId() != null) {
            incident = incidentRepository.findById(request.getIncidentId())
                    .orElseThrow(() -> new IllegalArgumentException("Incident not found"));
        }

        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus("OPEN");
        task.setPriority(request.getPriority().name());
        task.setDueDate(request.getDueDate());
        task.setAssignedToEmail(request.getAssignedToEmail());
        task.setIncident(incident);
        task.setCreatedAt(Instant.now());

        Task savedTask = taskRepository.save(task);

        eventPublisherService.publishTaskCreated(
                new TaskCreatedEvent(
                        savedTask.getId(),
                        savedTask.getTitle(),
                        savedTask.getDescription(),
                        savedTask.getAssignedToEmail(),
                        savedTask.getPriority(),
                        savedTask.getCreatedAt()
                )
        );

        return mapToResponse(savedTask);
    }

    public List<TaskResponse> getMyTasks(String email) {
        return taskRepository.findByAssignedToEmail(email)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public TaskResponse updateTask(Long taskId, CreateTaskRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        if (!userRepository.existsByEmail(request.getAssignedToEmail())) {
            throw new IllegalArgumentException("Assigned user not found");
        }

        Incident incident = null;
        if (request.getIncidentId() != null) {
            incident = incidentRepository.findById(request.getIncidentId())
                    .orElseThrow(() -> new IllegalArgumentException("Incident not found"));
        }

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority().name());
        task.setDueDate(request.getDueDate());
        task.setAssignedToEmail(request.getAssignedToEmail());
        task.setIncident(incident);

        Task updatedTask = taskRepository.save(task);
        return mapToResponse(updatedTask);
    }

    public TaskResponse updateTaskStatus(Long taskId, String status) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        task.setStatus(status.toUpperCase());

        Task updatedTask = taskRepository.save(task);
        return mapToResponse(updatedTask);
    }

    public void deleteTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        taskRepository.delete(task);
    }

    private TaskResponse mapToResponse(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getPriority(),
                task.getDueDate(),
                task.getAssignedToEmail(),
                task.getIncident() != null ? task.getIncident().getId() : null,
                task.getIncident() != null ? task.getIncident().getTitle() : null,
                task.getCreatedAt()
        );
    }
}