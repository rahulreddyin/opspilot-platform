package com.opspilot.platform.service;

import com.opspilot.platform.repository.HealthCheckRepository;
import org.springframework.stereotype.Service;

@Service
public class HealthService {

    private final HealthCheckRepository repository;

    public HealthService(HealthCheckRepository repository) {
        this.repository = repository;
    }

    public long countRecords() {
        return repository.count();
    }
}