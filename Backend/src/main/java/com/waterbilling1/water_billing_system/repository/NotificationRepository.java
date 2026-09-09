package com.waterbilling1.water_billing_system.repository;

import com.waterbilling1.water_billing_system.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByHouseholdUser_IdOrderByCreatedAtDesc(Long householdUserId, Pageable pageable);
    long countByHouseholdUser_IdAndIsReadFalse(Long householdUserId);
    Page<Notification> findByRecipientIdAndRecipientRoleOrderByCreatedAtDesc(Long recipientId, String recipientRole, Pageable pageable);
    long countByRecipientIdAndRecipientRoleAndIsReadFalse(Long recipientId, String recipientRole);
}