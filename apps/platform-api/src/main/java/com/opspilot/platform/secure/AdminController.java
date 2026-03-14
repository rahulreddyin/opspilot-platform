package com.opspilot.platform.secure;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class AdminController {

    @GetMapping("/api/v1/admin/ping")
    public Map<String, Object> adminPing(Authentication authentication) {
        return Map.of(
                "message", "Admin endpoint accessed successfully",
                "email", authentication.getName()
        );
    }
}