package com.opspilot.platform.repository;

import com.opspilot.platform.domain.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findTop20ByUserEmailOrderByCreatedAtDesc(String userEmail);

    long countByUserEmailAndReadFalse(String userEmail);

    Optional<Notification> findByIdAndUserEmail(Long id, String userEmail);

    void deleteByUserEmailIgnoreCase(String userEmail);
}