package com.opspilot.platform.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.opspilot.platform.domain.AuditLog;
import com.opspilot.platform.domain.Incident;
import com.opspilot.platform.domain.Role;
import com.opspilot.platform.domain.Task;
import com.opspilot.platform.domain.Team;
import com.opspilot.platform.domain.User;
import com.opspilot.platform.dto.ActivityFeedResponse;
import com.opspilot.platform.dto.AuditLogResponse;
import com.opspilot.platform.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;
    private final EventPublisherService eventPublisherService;

    public AuditLogService(AuditLogRepository auditLogRepository,
                           ObjectMapper objectMapper,
                           EventPublisherService eventPublisherService) {
        this.auditLogRepository = auditLogRepository;
        this.objectMapper = objectMapper;
        this.eventPublisherService = eventPublisherService;
    }

    public void logIncidentCreated(User actor, Incident incident) {
        createLog(actor, "INCIDENT_CREATED", "INCIDENT", incident.getId(), null, incident);
        publishActivity("INCIDENT_CREATED", "Incident created: " + incident.getTitle(), "INCIDENT", incident.getId());
    }

    public void logIncidentStatusUpdated(User actor, Incident before, Incident after) {
        createLog(actor, "INCIDENT_STATUS_UPDATED", "INCIDENT", after.getId(), before, after);
        publishActivity("INCIDENT_STATUS_UPDATED", "Incident status updated", "INCIDENT", after.getId());
    }

    public void logTaskCreated(User actor, Task task) {
        createLog(actor, "TASK_CREATED", "TASK", task.getId(), null, task);
        publishActivity("TASK_CREATED", "Task created: " + task.getTitle(), "TASK", task.getId());
    }

    public void logTaskStatusUpdated(User actor, Task before, Task after) {
        createLog(actor, "TASK_STATUS_UPDATED", "TASK", after.getId(), before, after);
        publishActivity("TASK_STATUS_UPDATED", "Task status updated", "TASK", after.getId());
    }

    public void logTaskUpdated(User actor, Task before, Task after) {
        createLog(actor, "TASK_UPDATED", "TASK", after.getId(), before, after);
        publishActivity("TASK_UPDATED", "Task updated: " + after.getTitle(), "TASK", after.getId());
    }

    public void logTaskDeleted(User actor, Task task) {
        createLog(actor, "TASK_DELETED", "TASK", task.getId(), task, null);
        publishActivity("TASK_DELETED", "Task deleted: " + task.getTitle(), "TASK", task.getId());
    }

    public void logTeamCreated(Team team) {
        Map<String, Object> newValue = Map.of(
                "teamId", team.getId(),
                "teamName", team.getName()
        );

        createSystemLog("TEAM_CREATED", "TEAM", team.getId(), null, newValue);
        publishActivity("TEAM_CREATED", "Team created: " + team.getName(), "TEAM", team.getId());
    }

    public void logTeamDeleted(Team team) {
        Map<String, Object> oldValue = Map.of(
                "teamId", team.getId(),
                "teamName", team.getName()
        );

        createSystemLog("TEAM_DELETED", "TEAM", team.getId(), oldValue, null);
        publishActivity("TEAM_DELETED", "Team deleted: " + team.getName(), "TEAM", team.getId());
    }

    public void logUserAssignedToTeam(User user, Team team) {
        Map<String, Object> newValue = Map.of(
                "userId", user.getId(),
                "userEmail", user.getEmail(),
                "teamId", team.getId(),
                "teamName", team.getName()
        );

        createSystemLog("USER_ASSIGNED_TO_TEAM", "USER", user.getId(), null, newValue);
        publishActivity(
                "USER_ASSIGNED_TO_TEAM",
                user.getEmail() + " assigned to team " + team.getName(),
                "USER",
                user.getId()
        );
    }

    public void logUserRemovedFromTeam(User user, String oldTeamName) {
        Map<String, Object> oldValue = Map.of(
                "userId", user.getId(),
                "userEmail", user.getEmail(),
                "oldTeamName", oldTeamName == null ? "No team" : oldTeamName
        );

        createSystemLog("USER_REMOVED_FROM_TEAM", "USER", user.getId(), oldValue, null);
        publishActivity(
                "USER_REMOVED_FROM_TEAM",
                user.getEmail() + " removed from team",
                "USER",
                user.getId()
        );
    }

    public void logUserRoleAdded(User user, Role role) {
        Map<String, Object> newValue = Map.of(
                "userId", user.getId(),
                "userEmail", user.getEmail(),
                "role", role.name()
        );

        createSystemLog("USER_ROLE_ADDED", "USER", user.getId(), null, newValue);
        publishActivity(
                "USER_ROLE_ADDED",
                role.name() + " role added to " + user.getEmail(),
                "USER",
                user.getId()
        );
    }

    public void logUserDeleted(User user) {
        Map<String, Object> oldValue = Map.of(
                "userId", user.getId(),
                "userEmail", user.getEmail(),
                "name", user.getName() == null ? "Unnamed User" : user.getName()
        );

        createSystemLog("USER_DELETED", "USER", user.getId(), oldValue, null);
        publishActivity("USER_DELETED", "User deleted: " + user.getEmail(), "USER", user.getId());
    }

    public List<AuditLogResponse> getRecentAuditLogs() {
        return auditLogRepository.findTop50ByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<AuditLogResponse> getAuditLogsForEntity(String entityType, Long entityId) {
        return auditLogRepository.findTop100ByEntityTypeAndEntityIdOrderByCreatedAtDesc(entityType, entityId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<ActivityFeedResponse> getRecentActivityFeed(String currentUserEmail) {
        return auditLogRepository.findTop50ByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToActivityFeedResponse)
                .toList();
    }

    private void createLog(User actor,
                           String action,
                           String entityType,
                           Long entityId,
                           Object oldValue,
                           Object newValue) {
        AuditLog log = new AuditLog();
        log.setActorUserId(actor != null ? actor.getId() : null);
        log.setActorEmail(actor != null ? actor.getEmail() : "SYSTEM");
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setOldValueJson(toJson(oldValue));
        log.setNewValueJson(toJson(newValue));
        log.setCreatedAt(Instant.now());

        auditLogRepository.save(log);
    }

    private void createSystemLog(String action,
                                 String entityType,
                                 Long entityId,
                                 Object oldValue,
                                 Object newValue) {
        createLog(null, action, entityType, entityId, oldValue, newValue);
    }

    private String toJson(Object value) {
        if (value == null) {
            return null;
        }

        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            return "{\"error\":\"serialization_failed\"}";
        }
    }

    private AuditLogResponse mapToResponse(AuditLog log) {
        return new AuditLogResponse(
                log.getId(),
                log.getActorUserId(),
                log.getActorEmail(),
                log.getAction(),
                log.getEntityType(),
                log.getEntityId(),
                log.getOldValueJson(),
                log.getNewValueJson(),
                log.getCreatedAt()
        );
    }

    public void logRateLimitHit(String key, String path) {
        AuditLog log = new AuditLog();
        log.setActorEmail("SYSTEM");
        log.setAction("RATE_LIMIT_HIT");
        log.setEntityType("SECURITY");
        log.setEntityId(0L);
        log.setOldValueJson(null);
        log.setNewValueJson("{\"key\":\"" + key + "\",\"path\":\"" + path + "\"}");
        log.setCreatedAt(Instant.now());

        auditLogRepository.save(log);
    }

    private ActivityFeedResponse mapToActivityFeedResponse(AuditLog log) {
        return new ActivityFeedResponse(
                log.getAction(),
                buildActivityMessage(log),
                log.getEntityType(),
                log.getEntityId(),
                log.getActorEmail(),
                log.getCreatedAt()
        );
    }

    private String buildActivityMessage(AuditLog log) {
        return switch (log.getAction()) {
            case "INCIDENT_CREATED" -> "Incident created";
            case "INCIDENT_STATUS_UPDATED" -> "Incident status updated";
            case "TASK_CREATED" -> "Task created";
            case "TASK_STATUS_UPDATED" -> "Task status updated";
            case "TASK_UPDATED" -> "Task updated";
            case "TASK_DELETED" -> "Task deleted";
            case "COMMENT_CREATED" -> "Comment added";
            case "TEAM_CREATED" -> "Team created";
            case "TEAM_DELETED" -> "Team deleted";
            case "USER_ASSIGNED_TO_TEAM" -> "User assigned to team";
            case "USER_REMOVED_FROM_TEAM" -> "User removed from team";
            case "USER_ROLE_ADDED" -> "User role updated";
            case "USER_DELETED" -> "User deleted";
            case "RATE_LIMIT_HIT" -> "Rate limit triggered";
            default -> log.getAction();
        };
    }

    private void publishActivity(String type,
                                 String message,
                                 String entityType,
                                 Long entityId) {
        eventPublisherService.publishActivityEvent(
                type,
                message,
                entityType,
                entityId
        );
    }
}