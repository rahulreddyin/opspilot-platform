package com.opspilot.platform.service;

import com.opspilot.platform.domain.Task;
import com.opspilot.platform.dto.CreateTaskRequest;
import com.opspilot.platform.dto.TaskResponse;
import com.opspilot.platform.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public TaskResponse createTask(CreateTaskRequest request) {
        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus("OPEN");
        task.setAssignedToEmail(request.getAssignedToEmail());
        task.setCreatedAt(Instant.now());

        Task saved = taskRepository.save(task);
        return map(saved);
    }

    public List<TaskResponse> getTasksForUser(String email) {
        return taskRepository.findByAssignedToEmail(email)
                .stream()
                .map(this::map)
                .toList();
    }

    private TaskResponse map(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getAssignedToEmail(),
                task.getCreatedAt()
        );
    }
}