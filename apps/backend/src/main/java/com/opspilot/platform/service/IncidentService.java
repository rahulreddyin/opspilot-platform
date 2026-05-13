package com.opspilot.platform.service;

import com.opspilot.platform.domain.Incident;
import com.opspilot.platform.domain.User;
import com.opspilot.platform.dto.CreateIncidentRequest;
import com.opspilot.platform.dto.IncidentResponse;
import com.opspilot.platform.events.IncidentCreatedEvent;
import com.opspilot.platform.events.IncidentStatusUpdatedEvent;
import com.opspilot.platform.exception.NotFoundException;
import com.opspilot.platform.repository.IncidentRepository;
import com.opspilot.platform.security.PermissionService;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final PermissionService permissionService;
    private final EventPublisherService eventPublisherService;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    public IncidentService(IncidentRepository incidentRepository,
                           PermissionService permissionService,
                           EventPublisherService eventPublisherService,
                           AuditLogService auditLogService,
                           NotificationService notificationService) {
        this.incidentRepository = incidentRepository;
        this.permissionService = permissionService;
        this.eventPublisherService = eventPublisherService;
        this.auditLogService = auditLogService;
        this.notificationService = notificationService;
    }

    public IncidentResponse createIncident(CreateIncidentRequest request, String currentUserEmail) {
        User actingUser = permissionService.getRequiredUser(currentUserEmail);
        permissionService.requireIncidentCreationPermission(actingUser);

        Incident incident = new Incident();
        incident.setTitle(request.getTitle());
        incident.setDescription(request.getDescription());
        incident.setSeverity(request.getSeverity());
        incident.setStatus("OPEN");
        incident.setOwnerEmail(actingUser.getEmail());
        incident.setImpactedService(request.getImpactedService());
        incident.setCreatedAt(Instant.now());

        Incident savedIncident = incidentRepository.save(incident);

        auditLogService.logIncidentCreated(actingUser, savedIncident);

        notificationService.createNotification(
                actingUser.getEmail(),
                "Incident created",
                "Incident created: " + savedIncident.getTitle(),
                "INCIDENT_CREATED",
                "INCIDENT",
                savedIncident.getId()
        );

        eventPublisherService.publishIncidentCreated(
                new IncidentCreatedEvent(
                        savedIncident.getId(),
                        savedIncident.getTitle(),
                        savedIncident.getDescription(),
                        savedIncident.getSeverity(),
                        savedIncident.getStatus(),
                        savedIncident.getOwnerEmail(),
                        savedIncident.getImpactedService(),
                        savedIncident.getCreatedAt()
                )
        );

        return mapToResponse(savedIncident);
    }

    public List<IncidentResponse> getMyIncidents(String email) {
        User user = permissionService.getRequiredUser(email);

        if (permissionService.isAdmin(user)) {
            return incidentRepository.findAll()
                    .stream()
                    .map(this::mapToResponse)
                    .toList();
        }

        return incidentRepository.findByOwnerEmail(user.getEmail())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public IncidentResponse updateIncidentStatus(Long incidentId, String status, String currentUserEmail) {
        Incident incident = getIncidentEntityById(incidentId);
        User actingUser = permissionService.getRequiredUser(currentUserEmail);

        permissionService.requireIncidentManagementPermission(actingUser, incident);

        Incident before = copyIncident(incident);

        incident.setStatus(status);
        Incident updatedIncident = incidentRepository.save(incident);

        auditLogService.logIncidentStatusUpdated(actingUser, before, updatedIncident);

        notificationService.createNotification(
                updatedIncident.getOwnerEmail(),
                "Incident status updated",
                "Incident " + updatedIncident.getTitle() + " is now " + updatedIncident.getStatus(),
                "INCIDENT_STATUS_UPDATED",
                "INCIDENT",
                updatedIncident.getId()
        );

        eventPublisherService.publishIncidentStatusUpdated(
                new IncidentStatusUpdatedEvent(
                        updatedIncident.getId(),
                        updatedIncident.getTitle(),
                        updatedIncident.getStatus()
                )
        );

        return mapToResponse(updatedIncident);
    }

    public Incident getIncidentEntityById(Long incidentId) {
        return incidentRepository.findById(incidentId)
                .orElseThrow(() -> new NotFoundException("Incident not found"));
    }

    private Incident copyIncident(Incident source) {
        Incident copy = new Incident();
        copy.setTitle(source.getTitle());
        copy.setDescription(source.getDescription());
        copy.setSeverity(source.getSeverity());
        copy.setStatus(source.getStatus());
        copy.setOwnerEmail(source.getOwnerEmail());
        copy.setImpactedService(source.getImpactedService());
        copy.setCreatedAt(source.getCreatedAt());

        try {
            java.lang.reflect.Field idField = Incident.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(copy, source.getId());
        } catch (Exception ignored) {
        }

        return copy;
    }

    private IncidentResponse mapToResponse(Incident incident) {
        return new IncidentResponse(
                incident.getId(),
                incident.getTitle(),
                incident.getDescription(),
                incident.getSeverity(),
                incident.getStatus(),
                incident.getImpactedService(),
                incident.getOwnerEmail(),
                incident.getCreatedAt()
        );
    }
}