package com.waterbilling1.water_billing_system.serviceImpl;

import com.waterbilling1.water_billing_system.dto.DeletedHouseholdLogResponse;
import com.waterbilling1.water_billing_system.dto.HouseholdUserSummaryResponse;
import com.waterbilling1.water_billing_system.dto.RegisterHouseholdUserRequest;
import com.waterbilling1.water_billing_system.entity.ApartmentAdmin;
import com.waterbilling1.water_billing_system.entity.DeletedHouseholdLog;
import com.waterbilling1.water_billing_system.entity.HouseholdUser;
import com.waterbilling1.water_billing_system.entity.Role;
import com.waterbilling1.water_billing_system.entity.Role.RoleName;
import com.waterbilling1.water_billing_system.exception.DuplicateResourceException;
import com.waterbilling1.water_billing_system.exception.ResourceNotFoundException;
import com.waterbilling1.water_billing_system.repository.ApartmentAdminRepository;
import com.waterbilling1.water_billing_system.repository.DeletedHouseholdLogRepository;
import com.waterbilling1.water_billing_system.repository.HouseholdUserRepository;
import com.waterbilling1.water_billing_system.repository.RoleRepository;
import com.waterbilling1.water_billing_system.service.HouseholdUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.waterbilling1.water_billing_system.service.EmailService;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HouseholdUserServiceImpl implements HouseholdUserService {

    private final HouseholdUserRepository householdUserRepository;
    private final ApartmentAdminRepository apartmentAdminRepository;
    private final RoleRepository roleRepository;
    private final DeletedHouseholdLogRepository deletedHouseholdLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Override
    @Transactional
    public HouseholdUserSummaryResponse registerHouseholdUser(Long apartmentAdminUserId, RegisterHouseholdUserRequest request) {

        ApartmentAdmin admin = apartmentAdminRepository.findById(apartmentAdminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Logged-in Apartment Admin not found."));

        if (householdUserRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("A household user with this email already exists.");
        }

        Role householdRole = roleRepository.findByName(RoleName.HOUSEHOLD_USER)
                .orElseThrow(() -> new ResourceNotFoundException("HOUSEHOLD_USER role not found."));

        HouseholdUser householdUser = HouseholdUser.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .flatNumber(request.getFlatNumber())
                .password(passwordEncoder.encode(request.getPassword()))
                .apartment(admin.getApartment())
                .role(householdRole)
                .mustChangePassword(false)
                .status("ACTIVE")
                .build();

        HouseholdUser saved = householdUserRepository.save(householdUser);

        String loginLink = "http://localhost:5173/login";
        emailService.sendHouseholdCredentialsEmail(saved.getEmail(), request.getPassword(), loginLink);

        return toSummary(saved);
    }

    @Override
    @Transactional
    public HouseholdUserSummaryResponse updateHouseholdUser(Long apartmentAdminUserId, Long householdUserId,
            com.waterbilling1.water_billing_system.dto.UpdateHouseholdUserRequest request) {

        ApartmentAdmin admin = apartmentAdminRepository.findById(apartmentAdminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Logged-in Apartment Admin not found."));

        HouseholdUser householdUser = householdUserRepository
                .findByIdAndApartment_Id(householdUserId, admin.getApartment().getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Household user not found in your apartment with ID: " + householdUserId));

        if (!householdUser.getEmail().equalsIgnoreCase(request.getEmail())
                && householdUserRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("A household user with this email already exists.");
        }

        householdUser.setFullName(request.getFullName());
        householdUser.setEmail(request.getEmail());
        householdUser.setPhoneNumber(request.getPhoneNumber());
        householdUser.setFlatNumber(request.getFlatNumber());
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            householdUser.setStatus(request.getStatus());
        }

        HouseholdUser saved = householdUserRepository.save(householdUser);
        return toSummary(saved);
    }

    @Override
    public List<HouseholdUserSummaryResponse> getHouseholdUsersForAdmin(Long apartmentAdminUserId) {
        ApartmentAdmin admin = apartmentAdminRepository.findById(apartmentAdminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Logged-in Apartment Admin not found."));

        return householdUserRepository.findByApartment_IdAndStatus(admin.getApartment().getId(), "ACTIVE")
                .stream().map(this::toSummary).toList();
    }

    @Override
    @Transactional
    public void deleteHouseholdUser(Long apartmentAdminUserId, Long householdUserId) {
        ApartmentAdmin admin = apartmentAdminRepository.findById(apartmentAdminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Logged-in Apartment Admin not found."));

        HouseholdUser householdUser = householdUserRepository
                .findByIdAndApartment_Id(householdUserId, admin.getApartment().getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Household user not found in your apartment with ID: " + householdUserId));

        if ("INACTIVE".equals(householdUser.getStatus())) {
            throw new IllegalStateException("This household has already been removed.");
        }

        DeletedHouseholdLog log = DeletedHouseholdLog.builder()
                .apartmentId(admin.getApartment().getId())
                .fullName(householdUser.getFullName())
                .email(householdUser.getEmail())
                .flatNumber(householdUser.getFlatNumber())
                .deletedAt(LocalDateTime.now())
                .build();
        deletedHouseholdLogRepository.save(log);

        // Soft delete: preserve the row (and all linked bills/readings) — just mark inactive
        householdUser.setStatus("INACTIVE");
        householdUserRepository.save(householdUser);
    }

    @Override
    public List<DeletedHouseholdLogResponse> getDeletedHouseholdLogs(Long apartmentAdminUserId) {
        ApartmentAdmin admin = apartmentAdminRepository.findById(apartmentAdminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Logged-in Apartment Admin not found."));

        return deletedHouseholdLogRepository.findByApartmentIdOrderByDeletedAtDesc(admin.getApartment().getId())
                .stream()
                .map(l -> DeletedHouseholdLogResponse.builder()
                        .id(l.getId())
                        .fullName(l.getFullName())
                        .email(l.getEmail())
                        .flatNumber(l.getFlatNumber())
                        .deletedAt(l.getDeletedAt())
                        .build())
                .toList();
    }

    private HouseholdUserSummaryResponse toSummary(HouseholdUser hu) {
        return HouseholdUserSummaryResponse.builder()
                .id(hu.getId())
                .fullName(hu.getFullName())
                .email(hu.getEmail())
                .phoneNumber(hu.getPhoneNumber())
                .flatNumber(hu.getFlatNumber())
                .status(hu.getStatus())
                .createdAt(hu.getCreatedAt())
                .build();
    }
}