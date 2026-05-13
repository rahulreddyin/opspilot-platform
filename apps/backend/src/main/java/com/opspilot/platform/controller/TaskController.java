package com.opspilot.platform.controller;

import com.opspilot.platform.dto.CreateTaskRequest;
import com.opspilot.platform.dto.TaskResponse;
import com.opspilot.platform.dto.UpdateTaskStatusRequest;
import com.opspilot.platform.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping("/my")
    public List<TaskResponse> getMyTasks(Authentication authentication) {
        String email = requireEmail(authentication);
        return taskService.getMyTasks(email);
    }

    @PostMapping
    public TaskResponse createTask(
            @Valid @RequestBody CreateTaskRequest request,
            Authentication authentication
    ) {
        String email = requireEmail(authentication);
        return taskService.createTask(request, email);
    }

    @PostMapping("/bulk-create")
    public List<TaskResponse> createBulkTasks(
            @Valid @RequestBody List<CreateTaskRequest> requests,
            Authentication authentication
    ) {
        String email = requireEmail(authentication);
        return taskService.createBulkTasks(requests, email);
    }

    @PutMapping("/{taskId}")
    public TaskResponse updateTask(
            @PathVariable Long taskId,
            @Valid @RequestBody CreateTaskRequest request,
            Authentication authentication
    ) {
        String email = requireEmail(authentication);
        return taskService.updateTask(taskId, request, email);
    }

    @PatchMapping("/{taskId}/status")
    public TaskResponse updateTaskStatus(
            @PathVariable Long taskId,
            @Valid @RequestBody UpdateTaskStatusRequest request,
            Authentication authentication
    ) {
        String email = requireEmail(authentication);
        return taskService.updateTaskStatus(taskId, request.getStatus(), email);
    }

    @DeleteMapping("/{taskId}")
    public void deleteTask(@PathVariable Long taskId, Authentication authentication) {
        String email = requireEmail(authentication);
        taskService.deleteTask(taskId, email);
    }

    private String requireEmail(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new RuntimeException("Authentication is missing");
        }

        return authentication.getName();
    }
}