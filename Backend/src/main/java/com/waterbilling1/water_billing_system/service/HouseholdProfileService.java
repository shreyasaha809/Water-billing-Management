package com.waterbilling1.water_billing_system.service;

import com.waterbilling1.water_billing_system.dto.ChangePasswordRequest;
import com.waterbilling1.water_billing_system.dto.HouseholdProfileResponse;
import com.waterbilling1.water_billing_system.dto.UpdateHouseholdProfileRequest;

public interface HouseholdProfileService {

    HouseholdProfileResponse getProfile(Long householdUserId);

    HouseholdProfileResponse updateProfile(Long householdUserId, UpdateHouseholdProfileRequest request);

    void changePassword(Long householdUserId, ChangePasswordRequest request);
}