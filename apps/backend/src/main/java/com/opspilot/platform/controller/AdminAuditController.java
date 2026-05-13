package com.opspilot.platform.controller;

import com.opspilot.platform.dto.AuditLogResponse;
import com.opspilot.platform.security.PermissionService;
import com.opspilot.platform.service.AuditLogService;
import jakarta.validation.constraints.NotBlank;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/audit")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminAuditController {

    private final AuditLogService auditLogService;
    private final PermissionService permissionService;

    public AdminAuditController(AuditLogService auditLogService,
                                PermissionService permissionService) {
        this.auditLogService = auditLogService;
        this.permissionService = permissionService;
    }

    @GetMapping("/recent")
    public List<AuditLogResponse> getRecentAuditLogs(Authentication authentication) {
        permissionService.requireAdmin(permissionService.getRequiredUser(authentication.getName()));
        return auditLogService.getRecentAuditLogs();
    }

    @GetMapping("/entity")
    public List<AuditLogResponse> getAuditLogsForEntity(@RequestParam @NotBlank String entityType,
                                                        @RequestParam Long entityId,
                                                        Authentication authentication) {
        permissionService.requireAdmin(permissionService.getRequiredUser(authentication.getName()));
        return auditLogService.getAuditLogsForEntity(entityType.toUpperCase(), entityId);
    }
}