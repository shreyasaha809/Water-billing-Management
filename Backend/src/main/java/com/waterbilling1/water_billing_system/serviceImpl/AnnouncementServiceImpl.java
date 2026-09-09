package com.waterbilling1.water_billing_system.serviceImpl;

import com.waterbilling1.water_billing_system.dto.*;
import com.waterbilling1.water_billing_system.entity.*;
import com.waterbilling1.water_billing_system.exception.ResourceNotFoundException;
import com.waterbilling1.water_billing_system.repository.*;
import com.waterbilling1.water_billing_system.service.AnnouncementService;
import com.waterbilling1.water_billing_system.service.EmailService;
import com.waterbilling1.water_billing_system.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnnouncementServiceImpl implements AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final AnnouncementReadRepository announcementReadRepository;
    private final ApartmentAdminRepository apartmentAdminRepository;
    private final HouseholdUserRepository householdUserRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Override
    @Transactional
    public AnnouncementResponse createAnnouncement(Long apartmentAdminUserId, CreateAnnouncementRequest request) {
        ApartmentAdmin admin = apartmentAdminRepository.findById(apartmentAdminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Apartment Admin not found."));

        Announcement announcement = Announcement.builder()
                .apartment(admin.getApartment())
                .createdBy(admin)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .priority(request.getPriority())
                .publishDate(request.getPublishDate())
                .expiryDate(request.getExpiryDate())
                .isActive(true)
                .build();

        Announcement saved = announcementRepository.save(announcement);

        notifyHouseholds(saved);

        return toResponse(saved, null);
    }

    @Override
    @Transactional
    public AnnouncementResponse updateAnnouncement(Long apartmentAdminUserId, Long announcementId, UpdateAnnouncementRequest request) {
        ApartmentAdmin admin = apartmentAdminRepository.findById(apartmentAdminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Apartment Admin not found."));

        Announcement announcement = announcementRepository.findByIdAndApartment_Id(announcementId, admin.getApartment().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found."));

        announcement.setTitle(request.getTitle());
        announcement.setDescription(request.getDescription());
        announcement.setCategory(request.getCategory());
        announcement.setPriority(request.getPriority());
        announcement.setPublishDate(request.getPublishDate());
        announcement.setExpiryDate(request.getExpiryDate());

        return toResponse(announcementRepository.save(announcement), null);
    }

    @Override
    @Transactional
    public void deleteAnnouncement(Long apartmentAdminUserId, Long announcementId) {
        ApartmentAdmin admin = apartmentAdminRepository.findById(apartmentAdminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Apartment Admin not found."));

        Announcement announcement = announcementRepository.findByIdAndApartment_Id(announcementId, admin.getApartment().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found."));

        announcementRepository.delete(announcement);
    }

    @Override
    public List<AnnouncementResponse> getAnnouncementsForAdmin(Long apartmentAdminUserId) {
        ApartmentAdmin admin = apartmentAdminRepository.findById(apartmentAdminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Apartment Admin not found."));

        return announcementRepository.findByApartment_IdOrderByPublishDateDesc(admin.getApartment().getId())
                .stream().map(a -> toResponse(a, null)).toList();
    }

    @Override
    @Transactional
    public int archiveExpiredAnnouncements(Long apartmentAdminUserId) {
        ApartmentAdmin admin = apartmentAdminRepository.findById(apartmentAdminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Apartment Admin not found."));

        List<Announcement> expired = announcementRepository
                .findByApartment_IdAndIsActiveTrueAndExpiryDateBefore(admin.getApartment().getId(), LocalDate.now());

        expired.forEach(a -> a.setIsActive(false));
        announcementRepository.saveAll(expired);

        return expired.size();
    }

    @Override
    public List<AnnouncementResponse> getAnnouncementsForHousehold(Long householdUserId) {
        HouseholdUser household = householdUserRepository.findById(householdUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Household user not found."));

        return announcementRepository.findByApartment_IdAndIsActiveTrueOrderByPublishDateDesc(household.getApartment().getId())
                .stream().map(a -> toResponse(a, householdUserId)).toList();
    }

    @Override
    public AnnouncementResponse getAnnouncementDetailForHousehold(Long householdUserId, Long announcementId) {
        HouseholdUser household = householdUserRepository.findById(householdUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Household user not found."));

        Announcement announcement = announcementRepository.findByIdAndApartment_Id(announcementId, household.getApartment().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found."));

        return toResponse(announcement, householdUserId);
    }

    @Override
    @Transactional
    public void markAsRead(Long householdUserId, Long announcementId) {
        HouseholdUser household = householdUserRepository.findById(householdUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Household user not found."));

        Announcement announcement = announcementRepository.findByIdAndApartment_Id(announcementId, household.getApartment().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found."));

        AnnouncementRead read = announcementReadRepository
                .findByAnnouncement_IdAndHouseholdUser_Id(announcementId, householdUserId)
                .orElseGet(() -> AnnouncementRead.builder()
                        .announcement(announcement)
                        .householdUser(household)
                        .isRead(false)
                        .build());

        read.setIsRead(true);
        read.setReadAt(LocalDateTime.now());
        announcementReadRepository.save(read);
    }

    @Override
    public AnnouncementUnreadCountResponse getUnreadCount(Long householdUserId) {
        HouseholdUser household = householdUserRepository.findById(householdUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Household user not found."));

        long totalActive = announcementRepository
                .findByApartment_IdAndIsActiveTrueOrderByPublishDateDesc(household.getApartment().getId()).size();

        long readCount = announcementReadRepository.findByHouseholdUser_Id(householdUserId)
                .stream().filter(AnnouncementRead::getIsRead).count();

        long unread = Math.max(totalActive - readCount, 0);

        return AnnouncementUnreadCountResponse.builder().unreadCount(unread).build();
    }

    private void notifyHouseholds(Announcement announcement) {
        List<HouseholdUser> households = householdUserRepository
                .findByApartment_IdAndStatus(announcement.getApartment().getId(), "ACTIVE");

        String priorityTag = "URGENT".equals(announcement.getPriority()) ? "🚨 URGENT: " : "";

        for (HouseholdUser household : households) {
            notificationService.notify(household,
                    priorityTag + "New Announcement: " + announcement.getTitle(),
                    announcement.getDescription(),
                    "URGENT".equals(announcement.getPriority()) ? "ERROR" : "INFO");

            emailService.sendAlertEmail(household.getEmail(),
                    priorityTag + "New Announcement — " + announcement.getTitle(),
                    "Hello " + household.getFullName() + ",\n\n" + announcement.getDescription() +
                            "\n\nCategory: " + announcement.getCategory() +
                            "\nPriority: " + announcement.getPriority() +
                            "\n\nLog in to your resident portal for more details.\n\nThank you.");
        }
    }

    private AnnouncementResponse toResponse(Announcement a, Long householdUserIdForReadStatus) {
        boolean isExpired = a.getExpiryDate() != null && a.getExpiryDate().isBefore(LocalDate.now());

        Boolean isRead = null;
        if (householdUserIdForReadStatus != null) {
            isRead = announcementReadRepository
                    .findByAnnouncement_IdAndHouseholdUser_Id(a.getId(), householdUserIdForReadStatus)
                    .map(AnnouncementRead::getIsRead)
                    .orElse(false);
        }

        return AnnouncementResponse.builder()
                .id(a.getId())
                .title(a.getTitle())
                .description(a.getDescription())
                .category(a.getCategory())
                .priority(a.getPriority())
                .createdByName(a.getCreatedBy().getFullName())
                .publishDate(a.getPublishDate())
                .expiryDate(a.getExpiryDate())
                .isActive(a.getIsActive())
                .isExpired(isExpired)
                .isRead(isRead)
                .createdAt(a.getCreatedAt())
                .build();
    }
}