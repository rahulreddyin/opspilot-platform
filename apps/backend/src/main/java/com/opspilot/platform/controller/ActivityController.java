package com.opspilot.platform.controller;

import com.opspilot.platform.dto.ActivityFeedResponse;
import com.opspilot.platform.service.AuditLogService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/activity")
@CrossOrigin(origins = "http://localhost:5173")
public class ActivityController {

    private final AuditLogService auditLogService;

    public ActivityController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping("/recent")
    public List<ActivityFeedResponse> getRecentActivity(Authentication authentication) {
        return auditLogService.getRecentActivityFeed(authentication.getName());
    }
}