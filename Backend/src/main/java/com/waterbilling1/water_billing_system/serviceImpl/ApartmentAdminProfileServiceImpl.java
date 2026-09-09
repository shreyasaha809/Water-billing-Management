package com.waterbilling1.water_billing_system.serviceImpl;

import com.waterbilling1.water_billing_system.dto.ApartmentAdminProfileResponse;
import com.waterbilling1.water_billing_system.dto.ChangePasswordRequest;
import com.waterbilling1.water_billing_system.dto.UpdateApartmentAdminProfileRequest;
import com.waterbilling1.water_billing_system.entity.ApartmentAdmin;
import com.waterbilling1.water_billing_system.exception.DuplicateResourceException;
import com.waterbilling1.water_billing_system.exception.ResourceNotFoundException;
import com.waterbilling1.water_billing_system.exception.UnauthorizedException;
import com.waterbilling1.water_billing_system.repository.ApartmentAdminRepository;
import com.waterbilling1.water_billing_system.service.ApartmentAdminProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApartmentAdminProfileServiceImpl implements ApartmentAdminProfileService {

    private final ApartmentAdminRepository apartmentAdminRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public ApartmentAdminProfileResponse getProfile(Long apartmentAdminUserId) {
        ApartmentAdmin admin = apartmentAdminRepository.findById(apartmentAdminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Apartment Admin not found."));
        return toProfile(admin);
    }

    @Override
    @Transactional
    public ApartmentAdminProfileResponse updateProfile(Long apartmentAdminUserId, UpdateApartmentAdminProfileRequest request) {
        ApartmentAdmin admin = apartmentAdminRepository.findById(apartmentAdminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Apartment Admin not found."));

        if (!admin.getEmail().equalsIgnoreCase(request.getEmail())
                && apartmentAdminRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("This email is already in use.");
        }

        admin.setFullName(request.getFullName());
        admin.setEmail(request.getEmail());
        admin.setPhoneNumber(request.getPhoneNumber());
        apartmentAdminRepository.save(admin);

        return toProfile(admin);
    }

    @Override
    @Transactional
    public void changePassword(Long apartmentAdminUserId, ChangePasswordRequest request) {
        ApartmentAdmin admin = apartmentAdminRepository.findById(apartmentAdminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Apartment Admin not found."));

        if (!passwordEncoder.matches(request.getCurrentPassword(), admin.getPassword())) {
            throw new UnauthorizedException("Current password is incorrect.");
        }

        admin.setPassword(passwordEncoder.encode(request.getNewPassword()));
        apartmentAdminRepository.save(admin);
    }

    private ApartmentAdminProfileResponse toProfile(ApartmentAdmin admin) {
        return ApartmentAdminProfileResponse.builder()
                .id(admin.getId())
                .fullName(admin.getFullName())
                .email(admin.getEmail())
                .phoneNumber(admin.getPhoneNumber())
                .apartmentName(admin.getApartment().getApartmentName())
                .apartmentAddress(admin.getApartment().getAddress())
                .city(admin.getApartment().getCity())
                .state(admin.getApartment().getState())
                .pinCode(admin.getApartment().getPinCode())
                .build();
    }
}