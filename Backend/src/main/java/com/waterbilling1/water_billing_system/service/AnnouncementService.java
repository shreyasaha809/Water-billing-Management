package com.waterbilling1.water_billing_system.service;

import com.waterbilling1.water_billing_system.dto.*;

import java.util.List;

public interface AnnouncementService {
    AnnouncementResponse createAnnouncement(Long apartmentAdminUserId, CreateAnnouncementRequest request);
    AnnouncementResponse updateAnnouncement(Long apartmentAdminUserId, Long announcementId, UpdateAnnouncementRequest request);
    void deleteAnnouncement(Long apartmentAdminUserId, Long announcementId);
    List<AnnouncementResponse> getAnnouncementsForAdmin(Long apartmentAdminUserId);
    int archiveExpiredAnnouncements(Long apartmentAdminUserId);

    List<AnnouncementResponse> getAnnouncementsForHousehold(Long householdUserId);
    AnnouncementResponse getAnnouncementDetailForHousehold(Long householdUserId, Long announcementId);
    void markAsRead(Long householdUserId, Long announcementId);
    AnnouncementUnreadCountResponse getUnreadCount(Long householdUserId);
}