package com.opspilot.platform.repository;

import com.opspilot.platform.domain.HealthCheck;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HealthCheckRepository extends JpaRepository<HealthCheck, Long> {
}