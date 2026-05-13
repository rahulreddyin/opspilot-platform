package com.opspilot.platform.repository;

import com.opspilot.platform.domain.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    // Recent logs
    List<AuditLog> findTop50ByOrderByCreatedAtDesc();

    // Entity-specific logs (IMPORTANT)
    List<AuditLog> findTop100ByEntityTypeAndEntityIdOrderByCreatedAtDesc(
            String entityType,
            Long entityId
    );
}