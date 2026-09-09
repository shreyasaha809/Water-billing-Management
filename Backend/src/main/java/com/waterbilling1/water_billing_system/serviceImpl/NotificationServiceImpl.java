package com.waterbilling1.water_billing_system.serviceImpl;

import com.waterbilling1.water_billing_system.dto.NotificationResponse;
import com.waterbilling1.water_billing_system.entity.HouseholdUser;
import com.waterbilling1.water_billing_system.entity.Notification;
import com.waterbilling1.water_billing_system.exception.ResourceNotFoundException;
import com.waterbilling1.water_billing_system.repository.NotificationRepository;
import com.waterbilling1.water_billing_system.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.messaging.simp.SimpMessagingTemplate;



import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public Page<NotificationResponse> getNotifications(Long householdUserId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return notificationRepository.findByHouseholdUser_IdOrderByCreatedAtDesc(householdUserId, pageable)
                .map(this::toResponse);
    }

    @Override
    public long getUnreadCount(Long householdUserId) {
        return notificationRepository.countByHouseholdUser_IdAndIsReadFalse(householdUserId);
    }

    @Override
    @Transactional
    public void markAsRead(Long householdUserId, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found."));

        if (!notification.getHouseholdUser().getId().equals(householdUserId)) {
            throw new ResourceNotFoundException("Notification not found for this household user.");
        }

        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(Long householdUserId) {
        List<Notification> unread = notificationRepository
                .findByHouseholdUser_IdOrderByCreatedAtDesc(householdUserId, Pageable.unpaged())
                .stream().filter(n -> !n.getIsRead()).toList();

        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
    }

    @Override
    @Transactional
    public void deleteNotification(Long householdUserId, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found."));

        if (!notification.getHouseholdUser().getId().equals(householdUserId)) {
            throw new ResourceNotFoundException("Notification not found for this household user.");
        }

        notificationRepository.delete(notification);
    }

    public void notify(HouseholdUser householdUser, String title, String message, String type) {
        Notification notification = Notification.builder()
                .householdUser(householdUser)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .build();
        Notification saved = notificationRepository.save(notification);

        try {
            messagingTemplate.convertAndSend(
                    "/topic/notifications/" + householdUser.getId(),
                    toResponse(saved)
            );
        } catch (Exception ex) {
            log.error("Failed to push live notification to household {}: {}", householdUser.getId(), ex.getMessage());
        }
    }

    @Override
    @Transactional
    public void notifyByRole(Long recipientId, String recipientRole, String title, String message, String type) {
        Notification notification = Notification.builder()
                .recipientId(recipientId)
                .recipientRole(recipientRole)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .build();
        Notification saved = notificationRepository.save(notification);

        try {
            messagingTemplate.convertAndSend(
                    "/topic/notifications/role/" + recipientRole + "/" + recipientId,
                    toResponse(saved)
            );
        } catch (Exception ex) {
            log.error("Failed to push live notification to {} {}: {}", recipientRole, recipientId, ex.getMessage());
        }
    }
    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .isRead(n.getIsRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}