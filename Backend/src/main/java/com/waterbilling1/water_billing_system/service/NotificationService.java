package com.waterbilling1.water_billing_system.service;

import com.waterbilling1.water_billing_system.dto.NotificationResponse;
import com.waterbilling1.water_billing_system.entity.HouseholdUser;
import org.springframework.data.domain.Page;

public interface NotificationService {
    Page<NotificationResponse> getNotifications(Long householdUserId, int page, int size);
    long getUnreadCount(Long householdUserId);
    void markAsRead(Long householdUserId, Long notificationId);
    void markAllAsRead(Long householdUserId);
    void deleteNotification(Long householdUserId, Long notificationId);

    // Internal helper — called by other services to create a notification
    void notify(HouseholdUser householdUser, String title, String message, String type);
    void notifyByRole(Long recipientId, String recipientRole, String title, String message, String type);
}
