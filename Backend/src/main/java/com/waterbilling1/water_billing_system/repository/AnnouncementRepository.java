package com.waterbilling1.water_billing_system.repository;

import com.waterbilling1.water_billing_system.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findByApartment_IdOrderByPublishDateDesc(Long apartmentId);
    Optional<Announcement> findByIdAndApartment_Id(Long id, Long apartmentId);
    List<Announcement> findByApartment_IdAndIsActiveTrueAndExpiryDateBefore(Long apartmentId, LocalDate date);
    List<Announcement> findByApartment_IdAndIsActiveTrueOrderByPublishDateDesc(Long apartmentId);
}