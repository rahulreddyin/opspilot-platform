package com.opspilot.platform.repository;

import com.opspilot.platform.domain.Incident;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IncidentRepository extends JpaRepository<Incident, Long> {
    List<Incident> findByOwnerEmail(String ownerEmail);
}