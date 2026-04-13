package com.opspilot.platform.service;

import com.opspilot.platform.domain.Incident;
import com.opspilot.platform.dto.CreateIncidentRequest;
import com.opspilot.platform.dto.IncidentResponse;
import com.opspilot.platform.events.IncidentCreatedEvent;
import com.opspilot.platform.events.IncidentStatusUpdatedEvent;
import com.opspilot.platform.repository.IncidentRepository;
import com.opspilot.platform.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final UserRepository userRepository;
    private final EventPublisherService eventPublisherService;

    public IncidentService(IncidentRepository incidentRepository,
                           UserRepository userRepository,
                           EventPublisherService eventPublisherService) {
        this.incidentRepository = incidentRepository;
        this.userRepository = userRepository;
        this.eventPublisherService = eventPublisherService;
    }

    public IncidentResponse createIncident(CreateIncidentRequest request) {
        if (!userRepository.existsByEmail(request.getOwnerEmail())) {
            throw new IllegalArgumentException("Incident owner not found");
        }

        Incident incident = new Incident();
        incident.setTitle(request.getTitle());
        incident.setDescription(request.getDescription());
        incident.setSeverity(request.getSeverity().toUpperCase());
        incident.setStatus("OPEN");
        incident.setImpactedService(request.getImpactedService());
        incident.setOwnerEmail(request.getOwnerEmail());
        incident.setCreatedAt(Instant.now());

        Incident savedIncident = incidentRepository.save(incident);

        eventPublisherService.publishIncidentCreated(
                new IncidentCreatedEvent(
                        savedIncident.getId(),
                        savedIncident.getTitle(),
                        savedIncident.getSeverity(),
                        savedIncident.getImpactedService(),
                        savedIncident.getOwnerEmail(),
                        savedIncident.getCreatedAt()
                )
        );

        return mapToResponse(savedIncident);
    }

    public List<IncidentResponse> getMyIncidents(String email) {
        return incidentRepository.findByOwnerEmail(email)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public IncidentResponse updateIncidentStatus(Long incidentId, String status) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new IllegalArgumentException("Incident not found"));

        incident.setStatus(status.toUpperCase());

        Incident updatedIncident = incidentRepository.save(incident);

        eventPublisherService.publishIncidentStatusUpdated(
                new IncidentStatusUpdatedEvent(
                        updatedIncident.getId(),
                        updatedIncident.getStatus(),
                        Instant.now()
                )
        );

        return mapToResponse(updatedIncident);
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