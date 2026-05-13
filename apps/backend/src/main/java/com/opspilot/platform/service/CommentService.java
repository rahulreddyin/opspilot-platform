package com.opspilot.platform.service;

import com.opspilot.platform.domain.Comment;
import com.opspilot.platform.domain.Incident;
import com.opspilot.platform.domain.Task;
import com.opspilot.platform.domain.User;
import com.opspilot.platform.dto.CommentResponse;
import com.opspilot.platform.dto.CreateCommentRequest;
import com.opspilot.platform.events.CommentCreatedEvent;
import com.opspilot.platform.exception.BadRequestException;
import com.opspilot.platform.repository.CommentRepository;
import com.opspilot.platform.security.PermissionService;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final PermissionService permissionService;
    private final IncidentService incidentService;
    private final TaskService taskService;
    private final EventPublisherService eventPublisherService;
    private final NotificationService notificationService;

    public CommentService(CommentRepository commentRepository,
                          PermissionService permissionService,
                          IncidentService incidentService,
                          TaskService taskService,
                          EventPublisherService eventPublisherService,
                          NotificationService notificationService) {
        this.commentRepository = commentRepository;
        this.permissionService = permissionService;
        this.incidentService = incidentService;
        this.taskService = taskService;
        this.eventPublisherService = eventPublisherService;
        this.notificationService = notificationService;
    }

    public CommentResponse addIncidentComment(Long incidentId,
                                              CreateCommentRequest request,
                                              String currentUserEmail) {
        User actingUser = permissionService.getRequiredUser(currentUserEmail);
        Incident incident = incidentService.getIncidentEntityById(incidentId);

        permissionService.requireIncidentReadPermission(actingUser, incident);

        Comment comment = new Comment();
        comment.setEntityType("INCIDENT");
        comment.setEntityId(incidentId);
        comment.setAuthorEmail(actingUser.getEmail());
        comment.setContent(normalizeContent(request.getContent()));
        comment.setCreatedAt(Instant.now());

        Comment saved = commentRepository.save(comment);

        eventPublisherService.publishCommentCreated(
                new CommentCreatedEvent(
                        saved.getId(),
                        saved.getEntityType(),
                        saved.getEntityId(),
                        saved.getAuthorEmail(),
                        saved.getContent(),
                        saved.getCreatedAt()
                )
        );

        if (!incident.getOwnerEmail().equalsIgnoreCase(actingUser.getEmail())) {
            notificationService.createNotification(
                    incident.getOwnerEmail(),
                    "New incident comment",
                    actingUser.getEmail() + " commented on incident: " + incident.getTitle(),
                    "INCIDENT_COMMENT",
                    "INCIDENT",
                    incident.getId()
            );
        }

        return mapToResponse(saved);
    }

    public CommentResponse addTaskComment(Long taskId,
                                          CreateCommentRequest request,
                                          String currentUserEmail) {
        User actingUser = permissionService.getRequiredUser(currentUserEmail);
        Task task = taskService.getTaskEntityById(taskId);

        permissionService.requireTaskReadPermission(actingUser, task);

        Comment comment = new Comment();
        comment.setEntityType("TASK");
        comment.setEntityId(taskId);
        comment.setAuthorEmail(actingUser.getEmail());
        comment.setContent(normalizeContent(request.getContent()));
        comment.setCreatedAt(Instant.now());

        Comment saved = commentRepository.save(comment);

        eventPublisherService.publishCommentCreated(
                new CommentCreatedEvent(
                        saved.getId(),
                        saved.getEntityType(),
                        saved.getEntityId(),
                        saved.getAuthorEmail(),
                        saved.getContent(),
                        saved.getCreatedAt()
                )
        );

        if (!task.getAssignedToEmail().equalsIgnoreCase(actingUser.getEmail())) {
            notificationService.createNotification(
                    task.getAssignedToEmail(),
                    "New task comment",
                    actingUser.getEmail() + " commented on task: " + task.getTitle(),
                    "TASK_COMMENT",
                    "TASK",
                    task.getId()
            );
        }

        return mapToResponse(saved);
    }

    public List<CommentResponse> getIncidentComments(Long incidentId, String currentUserEmail) {
        User actingUser = permissionService.getRequiredUser(currentUserEmail);
        Incident incident = incidentService.getIncidentEntityById(incidentId);

        permissionService.requireIncidentReadPermission(actingUser, incident);

        return commentRepository.findByEntityTypeAndEntityIdOrderByCreatedAtAsc("INCIDENT", incidentId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<CommentResponse> getTaskComments(Long taskId, String currentUserEmail) {
        User actingUser = permissionService.getRequiredUser(currentUserEmail);
        Task task = taskService.getTaskEntityById(taskId);

        permissionService.requireTaskReadPermission(actingUser, task);

        return commentRepository.findByEntityTypeAndEntityIdOrderByCreatedAtAsc("TASK", taskId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private String normalizeContent(String content) {
        if (content == null || content.trim().isBlank()) {
            throw new BadRequestException("Comment content is required");
        }
        return content.trim();
    }

    private CommentResponse mapToResponse(Comment comment) {
        return new CommentResponse(
                comment.getId(),
                comment.getEntityType(),
                comment.getEntityId(),
                comment.getAuthorEmail(),
                comment.getContent(),
                comment.getCreatedAt()
        );
    }
}