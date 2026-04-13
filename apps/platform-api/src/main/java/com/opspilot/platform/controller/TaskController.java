package com.opspilot.platform.controller;

import com.opspilot.platform.dto.CreateTaskRequest;
import com.opspilot.platform.dto.TaskResponse;
import com.opspilot.platform.dto.UpdateTaskStatusRequest;
import com.opspilot.platform.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
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

    @PreAuthorize("hasAnyRole('USER','ADMIN','INCIDENT_MANAGER')")
    @PostMapping
    public TaskResponse createTask(@Valid @RequestBody CreateTaskRequest request) {
        return taskService.createTask(request);
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN','INCIDENT_MANAGER')")
    @GetMapping("/my")
    public List<TaskResponse> getMyTasks(Authentication authentication) {
        return taskService.getMyTasks(authentication.getName());
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN','INCIDENT_MANAGER')")
    @PutMapping("/{taskId}")
    public TaskResponse updateTask(@PathVariable Long taskId,
                                   @Valid @RequestBody CreateTaskRequest request) {
        return taskService.updateTask(taskId, request);
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN','INCIDENT_MANAGER')")
    @PatchMapping("/{taskId}/status")
    public TaskResponse updateTaskStatus(@PathVariable Long taskId,
                                         @Valid @RequestBody UpdateTaskStatusRequest request) {
        return taskService.updateTaskStatus(taskId, request.getStatus());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{taskId}")
    public void deleteTask(@PathVariable Long taskId) {
        taskService.deleteTask(taskId);
    }
}