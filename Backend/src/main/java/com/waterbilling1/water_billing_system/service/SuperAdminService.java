package com.waterbilling1.water_billing_system.service;

import com.waterbilling1.water_billing_system.dto.*;

import java.util.List;

public interface SuperAdminService {

    List<ApartmentAdminSummaryResponse> getPendingApartmentAdmins();

    List<ApartmentAdminSummaryResponse> getAllApartmentAdmins();

    ApprovalActionResponse approveApartmentAdmin(Long id);

    ApprovalActionResponse rejectApartmentAdmin(Long id);

    List<HouseholdUserSummaryResponse> getAllHouseholdUsers();

    SuperAdminProfileResponse getProfile(Long superAdminId);

    SuperAdminProfileResponse updateProfile(Long superAdminId, UpdateProfileRequest request);

    void changePassword(Long superAdminId, ChangePasswordRequest request);

    void deleteApartmentAdmin(Long apartmentAdminId);

    List<DeletedApartmentLogResponse> getDeletedApartmentLogs();

    long getHouseholdsWithReadingsCount();

    List<HouseholdUserSummaryResponse> getHouseholdsByApartment(Long apartmentId);
}