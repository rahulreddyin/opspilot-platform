package com.opspilot.platform.service;

import com.opspilot.platform.domain.Comment;
import com.opspilot.platform.domain.Incident;
import com.opspilot.platform.domain.Task;
import com.opspilot.platform.domain.User;
import com.opspilot.platform.dto.TimelineEntryResponse;
import com.opspilot.platform.repository.AuditLogRepository;
import com.opspilot.platform.repository.CommentRepository;
import com.opspilot.platform.security.PermissionService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class TimelineService {

    private final AuditLogRepository auditLogRepository;
    private final CommentRepository commentRepository;
    private final PermissionService permissionService;
    private final IncidentService incidentService;
    private final TaskService taskService;

    public TimelineService(AuditLogRepository auditLogRepository,
                           CommentRepository commentRepository,
                           PermissionService permissionService,
                           IncidentService incidentService,
                           TaskService taskService) {
        this.auditLogRepository = auditLogRepository;
        this.commentRepository = commentRepository;
        this.permissionService = permissionService;
        this.incidentService = incidentService;
        this.taskService = taskService;
    }

    public List<TimelineEntryResponse> getIncidentTimeline(Long incidentId, String currentUserEmail) {
        User user = permissionService.getRequiredUser(currentUserEmail);
        Incident incident = incidentService.getIncidentEntityById(incidentId);
        permissionService.requireIncidentReadPermission(user, incident);

        List<TimelineEntryResponse> entries = new ArrayList<>();

        auditLogRepository.findTop100ByEntityTypeAndEntityIdOrderByCreatedAtDesc("INCIDENT", incidentId)
                .forEach(log -> entries.add(
                        new TimelineEntryResponse(
                                "AUDIT",
                                log.getActorEmail(),
                                buildAuditMessage(log.getAction(), "INCIDENT"),
                                log.getCreatedAt()
                        )
                ));

        List<Comment> comments = commentRepository.findByEntityTypeAndEntityIdOrderByCreatedAtAsc("INCIDENT", incidentId);
        comments.forEach(comment -> entries.add(
                new TimelineEntryResponse(
                        "COMMENT",
                        comment.getAuthorEmail(),
                        comment.getContent(),
                        comment.getCreatedAt()
                )
        ));

        return entries.stream()
                .sorted(Comparator.comparing(TimelineEntryResponse::getCreatedAt).reversed())
                .toList();
    }

    public List<TimelineEntryResponse> getTaskTimeline(Long taskId, String currentUserEmail) {
        User user = permissionService.getRequiredUser(currentUserEmail);
        Task task = taskService.getTaskEntityById(taskId);
        permissionService.requireTaskReadPermission(user, task);

        List<TimelineEntryResponse> entries = new ArrayList<>();

        auditLogRepository.findTop100ByEntityTypeAndEntityIdOrderByCreatedAtDesc("TASK", taskId)
                .forEach(log -> entries.add(
                        new TimelineEntryResponse(
                                "AUDIT",
                                log.getActorEmail(),
                                buildAuditMessage(log.getAction(), "TASK"),
                                log.getCreatedAt()
                        )
                ));

        List<Comment> comments = commentRepository.findByEntityTypeAndEntityIdOrderByCreatedAtAsc("TASK", taskId);
        comments.forEach(comment -> entries.add(
                new TimelineEntryResponse(
                        "COMMENT",
                        comment.getAuthorEmail(),
                        comment.getContent(),
                        comment.getCreatedAt()
                )
        ));

        return entries.stream()
                .sorted(Comparator.comparing(TimelineEntryResponse::getCreatedAt).reversed())
                .toList();
    }

    private String buildAuditMessage(String action, String entityType) {
        return switch (action) {
            case "INCIDENT_CREATED" -> "Incident created";
            case "INCIDENT_STATUS_UPDATED" -> "Incident status updated";
            case "TASK_CREATED" -> "Task created";
            case "TASK_UPDATED" -> "Task updated";
            case "TASK_STATUS_UPDATED" -> "Task status updated";
            case "TASK_DELETED" -> "Task deleted";
            default -> entityType + " event: " + action;
        };
    }
}