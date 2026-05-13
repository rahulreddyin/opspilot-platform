package com.opspilot.platform.security;

import com.opspilot.platform.domain.Incident;
import com.opspilot.platform.domain.Role;
import com.opspilot.platform.domain.Task;
import com.opspilot.platform.domain.User;
import com.opspilot.platform.exception.BadRequestException;
import com.opspilot.platform.exception.ForbiddenException;
import com.opspilot.platform.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class PermissionService {

    private final UserRepository userRepository;

    public PermissionService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getRequiredUser(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
    }

    public boolean isAdmin(User user) {
        return user.getRoles() != null && user.getRoles().contains(Role.ADMIN);
    }

    public boolean isIncidentManager(User user) {
        return user.getRoles() != null && user.getRoles().contains(Role.INCIDENT_MANAGER);
    }

    public void requireIncidentCreationPermission(User user) {
        if (isAdmin(user) || isIncidentManager(user)) {
            return;
        }
        throw new ForbiddenException("You are not authorized to create incidents");
    }

    public void requireIncidentManagementPermission(User user, Incident incident) {
        if (isAdmin(user) || isIncidentManager(user)) {
            return;
        }

        if (incident.getOwnerEmail() != null &&
                incident.getOwnerEmail().equalsIgnoreCase(user.getEmail())) {
            return;
        }

        throw new ForbiddenException("You are not authorized to manage this incident");
    }

    public void requireIncidentReadPermission(User user, Incident incident) {
        if (isAdmin(user) || isIncidentManager(user)) {
            return;
        }

        if (incident.getOwnerEmail() != null &&
                incident.getOwnerEmail().equalsIgnoreCase(user.getEmail())) {
            return;
        }

        throw new ForbiddenException("You are not authorized to view this incident");
    }

    public void requireTaskManagementPermission(User user, Task task) {
        if (isAdmin(user) || isIncidentManager(user)) {
            return;
        }

        if (task.getAssignedToEmail() != null &&
                task.getAssignedToEmail().equalsIgnoreCase(user.getEmail())) {
            return;
        }

        if (task.getIncident() != null &&
                task.getIncident().getOwnerEmail() != null &&
                task.getIncident().getOwnerEmail().equalsIgnoreCase(user.getEmail())) {
            return;
        }

        throw new ForbiddenException("You are not authorized to manage this task");
    }



    public void requireAdmin(User user) {
    if (!isAdmin(user)) {
        throw new ForbiddenException("Admin access required");
    }
}

    public void requireTaskReadPermission(User user, Task task) {
        if (isAdmin(user) || isIncidentManager(user)) {
            return;
        }

        if (task.getAssignedToEmail() != null &&
                task.getAssignedToEmail().equalsIgnoreCase(user.getEmail())) {
            return;
        }

        if (task.getIncident() != null &&
                task.getIncident().getOwnerEmail() != null &&
                task.getIncident().getOwnerEmail().equalsIgnoreCase(user.getEmail())) {
            return;
        }

        throw new ForbiddenException("You are not authorized to view this task");
    }
}