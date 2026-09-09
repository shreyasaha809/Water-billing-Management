package com.waterbilling1.water_billing_system.service;

import com.waterbilling1.water_billing_system.dto.DeletedHouseholdLogResponse;
import com.waterbilling1.water_billing_system.dto.HouseholdUserSummaryResponse;
import com.waterbilling1.water_billing_system.dto.RegisterHouseholdUserRequest;

import java.util.List;

public interface HouseholdUserService {

    HouseholdUserSummaryResponse registerHouseholdUser(Long apartmentAdminUserId, RegisterHouseholdUserRequest request);

    HouseholdUserSummaryResponse updateHouseholdUser(Long apartmentAdminUserId, Long householdUserId, com.waterbilling1.water_billing_system.dto.UpdateHouseholdUserRequest request);

    List<HouseholdUserSummaryResponse> getHouseholdUsersForAdmin(Long apartmentAdminUserId);

    void deleteHouseholdUser(Long apartmentAdminUserId, Long householdUserId);

    List<DeletedHouseholdLogResponse> getDeletedHouseholdLogs(Long apartmentAdminUserId);
}