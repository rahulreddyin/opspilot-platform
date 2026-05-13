package com.opspilot.platform.secure;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class SecureController {

    @GetMapping("/api/v1/secure/me")
    public Map<String, Object> me(Authentication authentication) {
        return Map.of(
                "message", "Protected endpoint accessed successfully",
                "email", authentication.getName()
        );
    }
}