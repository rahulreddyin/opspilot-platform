package com.opspilot.platform.service;

import com.opspilot.platform.domain.Notification;
import com.opspilot.platform.dto.NotificationResponse;
import com.opspilot.platform.events.NotificationEvent;
import com.opspilot.platform.repository.NotificationRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(NotificationRepository notificationRepository,
                               SimpMessagingTemplate messagingTemplate) {
        this.notificationRepository = notificationRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public NotificationResponse createNotification(String userEmail,
                                                   String title,
                                                   String message,
                                                   String type,
                                                   String entityType,
                                                   Long entityId) {
        if (userEmail == null || userEmail.isBlank()) {
            throw new IllegalArgumentException("Notification user email is required");
        }

        Notification notification = new Notification();
        notification.setUserEmail(userEmail.trim().toLowerCase());
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setEntityType(entityType);
        notification.setEntityId(entityId);
        notification.setRead(false);
        notification.setCreatedAt(Instant.now());

        Notification saved = notificationRepository.save(notification);

        NotificationEvent event = new NotificationEvent(
                saved.getId(),
                saved.getUserEmail(),
                saved.getTitle(),
                saved.getMessage(),
                saved.getType(),
                saved.getEntityType(),
                saved.getEntityId(),
                saved.isRead(),
                saved.getCreatedAt()
        );

        messagingTemplate.convertAndSend(
                "/topic/notifications/" + saved.getUserEmail(),
                event
        );

        return mapToResponse(saved);
    }

    public List<NotificationResponse> getRecentNotifications(String userEmail) {
        return notificationRepository
                .findTop20ByUserEmailOrderByCreatedAtDesc(userEmail.toLowerCase())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public long getUnreadCount(String userEmail) {
        return notificationRepository.countByUserEmailAndReadFalse(
                userEmail.toLowerCase()
        );
    }

    public NotificationResponse markAsRead(Long notificationId, String userEmail) {
        Notification notification = notificationRepository
                .findByIdAndUserEmail(notificationId, userEmail.toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));

        notification.setRead(true);
        Notification saved = notificationRepository.save(notification);

        return mapToResponse(saved);
    }

    @Transactional
    public void markAllAsRead(String userEmail) {
        List<Notification> notifications = notificationRepository
                .findTop20ByUserEmailOrderByCreatedAtDesc(userEmail.toLowerCase());

        notifications.forEach(notification -> notification.setRead(true));
        notificationRepository.saveAll(notifications);
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getUserEmail(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getType(),
                notification.getEntityType(),
                notification.getEntityId(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }
}