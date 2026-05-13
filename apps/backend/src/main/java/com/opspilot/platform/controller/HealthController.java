package com.opspilot.platform.controller;

import com.opspilot.platform.service.HealthService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HealthController {

    private final HealthService service;

    public HealthController(HealthService service) {
        this.service = service;
    }

    @GetMapping("/health-db")
    public Map<String, Object> health() {
        return Map.of(
                "status", "UP",
                "records", service.countRecords()
        );
    }
}