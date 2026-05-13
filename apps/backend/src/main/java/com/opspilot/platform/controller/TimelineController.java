package com.opspilot.platform.controller;

import com.opspilot.platform.dto.TimelineEntryResponse;
import com.opspilot.platform.service.TimelineService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "http://localhost:5173")
public class TimelineController {

    private final TimelineService timelineService;

    public TimelineController(TimelineService timelineService) {
        this.timelineService = timelineService;
    }

    @GetMapping("/incidents/{incidentId}/timeline")
    public List<TimelineEntryResponse> getIncidentTimeline(@PathVariable Long incidentId,
                                                           Authentication authentication) {
        return timelineService.getIncidentTimeline(incidentId, authentication.getName());
    }

    @GetMapping("/tasks/{taskId}/timeline")
    public List<TimelineEntryResponse> getTaskTimeline(@PathVariable Long taskId,
                                                       Authentication authentication) {
        return timelineService.getTaskTimeline(taskId, authentication.getName());
    }
}