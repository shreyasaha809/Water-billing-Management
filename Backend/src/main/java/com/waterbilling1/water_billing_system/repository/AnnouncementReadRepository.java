package com.waterbilling1.water_billing_system.repository;

import com.waterbilling1.water_billing_system.entity.AnnouncementRead;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AnnouncementReadRepository extends JpaRepository<AnnouncementRead, Long> {
    Optional<AnnouncementRead> findByAnnouncement_IdAndHouseholdUser_Id(Long announcementId, Long householdUserId);
    List<AnnouncementRead> findByHouseholdUser_Id(Long householdUserId);
    long countByHouseholdUser_IdAndIsReadFalse(Long householdUserId);
}