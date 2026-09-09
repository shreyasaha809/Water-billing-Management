package com.waterbilling1.water_billing_system.serviceImpl;

import com.waterbilling1.water_billing_system.dto.ChangePasswordRequest;
import com.waterbilling1.water_billing_system.dto.HouseholdProfileResponse;
import com.waterbilling1.water_billing_system.dto.UpdateHouseholdProfileRequest;
import com.waterbilling1.water_billing_system.entity.ApartmentAdmin;
import com.waterbilling1.water_billing_system.entity.HouseholdUser;
import com.waterbilling1.water_billing_system.exception.DuplicateResourceException;
import com.waterbilling1.water_billing_system.exception.ResourceNotFoundException;
import com.waterbilling1.water_billing_system.exception.UnauthorizedException;
import com.waterbilling1.water_billing_system.repository.ApartmentAdminRepository;
import com.waterbilling1.water_billing_system.repository.HouseholdUserRepository;
import com.waterbilling1.water_billing_system.service.HouseholdProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HouseholdProfileServiceImpl implements HouseholdProfileService {

    private final HouseholdUserRepository householdUserRepository;
    private final ApartmentAdminRepository apartmentAdminRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public HouseholdProfileResponse getProfile(Long householdUserId) {
        HouseholdUser hu = householdUserRepository.findById(householdUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Household user not found."));
        return toProfile(hu);
    }

    @Override
    @Transactional
    public HouseholdProfileResponse updateProfile(Long householdUserId, UpdateHouseholdProfileRequest request) {
        HouseholdUser hu = householdUserRepository.findById(householdUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Household user not found."));

        if (!hu.getEmail().equalsIgnoreCase(request.getEmail())
                && householdUserRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("This email is already in use.");
        }

        hu.setFullName(request.getFullName());
        hu.setEmail(request.getEmail());
        hu.setPhoneNumber(request.getPhoneNumber());
        householdUserRepository.save(hu);

        return toProfile(hu);
    }

    @Override
    @Transactional
    public void changePassword(Long householdUserId, ChangePasswordRequest request) {
        HouseholdUser hu = householdUserRepository.findById(householdUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Household user not found."));

        if (!passwordEncoder.matches(request.getCurrentPassword(), hu.getPassword())) {
            throw new UnauthorizedException("Current password is incorrect.");
        }

        hu.setPassword(passwordEncoder.encode(request.getNewPassword()));
        householdUserRepository.save(hu);
    }

    private HouseholdProfileResponse toProfile(HouseholdUser hu) {
        String adminName = apartmentAdminRepository.findByApartment_Id(hu.getApartment().getId())
                .map(ApartmentAdmin::getFullName)
                .orElse("N/A");

        return HouseholdProfileResponse.builder()
                .id(hu.getId())
                .fullName(hu.getFullName())
                .email(hu.getEmail())
                .phoneNumber(hu.getPhoneNumber())
                .flatNumber(hu.getFlatNumber())
                .apartmentName(hu.getApartment().getApartmentName())
                .apartmentAdminName(adminName)
                .status(hu.getStatus())
                .build();
    }
}