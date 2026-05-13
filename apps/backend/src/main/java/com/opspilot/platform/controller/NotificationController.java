package com.opspilot.platform.controller;

import com.opspilot.platform.dto.NotificationResponse;
import com.opspilot.platform.dto.UnreadNotificationCountResponse;
import com.opspilot.platform.service.NotificationService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/recent")
    public List<NotificationResponse> getRecentNotifications(Authentication authentication) {
        return notificationService.getRecentNotifications(authentication.getName());
    }

    @GetMapping("/unread-count")
    public UnreadNotificationCountResponse getUnreadCount(Authentication authentication) {
        return new UnreadNotificationCountResponse(
                notificationService.getUnreadCount(authentication.getName())
        );
    }

    @PatchMapping("/{notificationId}/read")
    public NotificationResponse markAsRead(@PathVariable Long notificationId,
                                           Authentication authentication) {
        return notificationService.markAsRead(notificationId, authentication.getName());
    }

    @PatchMapping("/read-all")
    public void markAllAsRead(Authentication authentication) {
        notificationService.markAllAsRead(authentication.getName());
    }
}