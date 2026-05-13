package com.opspilot.platform.controller;

import com.opspilot.platform.dto.CreateIncidentRequest;
import com.opspilot.platform.dto.IncidentResponse;
import com.opspilot.platform.dto.UpdateIncidentStatusRequest;
import com.opspilot.platform.service.IncidentService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/incidents")
@CrossOrigin(origins = "http://localhost:5173")
public class IncidentController {

    private final IncidentService incidentService;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    @PostMapping
    public IncidentResponse createIncident(@Valid @RequestBody CreateIncidentRequest request,
                                           Authentication authentication) {
        return incidentService.createIncident(request, authentication.getName());
    }

    @GetMapping("/my")
    public List<IncidentResponse> getMyIncidents(Authentication authentication) {
        return incidentService.getMyIncidents(authentication.getName());
    }

    @PatchMapping("/{incidentId}/status")
    public IncidentResponse updateIncidentStatus(@PathVariable Long incidentId,
                                                 @Valid @RequestBody UpdateIncidentStatusRequest request,
                                                 Authentication authentication) {
        return incidentService.updateIncidentStatus(
                incidentId,
                request.getStatus(),
                authentication.getName()
        );
    }
}