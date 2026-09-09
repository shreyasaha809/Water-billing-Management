package com.waterbilling1.water_billing_system.service;

import com.waterbilling1.water_billing_system.dto.ApartmentAdminProfileResponse;
import com.waterbilling1.water_billing_system.dto.ChangePasswordRequest;
import com.waterbilling1.water_billing_system.dto.UpdateApartmentAdminProfileRequest;

public interface ApartmentAdminProfileService {

    ApartmentAdminProfileResponse getProfile(Long apartmentAdminUserId);

    ApartmentAdminProfileResponse updateProfile(Long apartmentAdminUserId, UpdateApartmentAdminProfileRequest request);

    void changePassword(Long apartmentAdminUserId, ChangePasswordRequest request);
}