package com.opspilot.platform.secure;

import com.opspilot.platform.dto.AdminUserPerformanceResponse;
import com.opspilot.platform.service.AdminTeamService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final AdminTeamService adminTeamService;

    public AdminController(AdminTeamService adminTeamService) {
        this.adminTeamService = adminTeamService;
    }

    @GetMapping("/ping")
    public Map<String, Object> adminPing(Authentication authentication) {
        return Map.of(
                "message", "Admin endpoint accessed successfully",
                "email", authentication.getName()
        );
    }


}