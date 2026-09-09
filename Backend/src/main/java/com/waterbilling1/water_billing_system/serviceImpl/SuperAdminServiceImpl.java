package com.waterbilling1.water_billing_system.serviceImpl;

import com.waterbilling1.water_billing_system.dto.*;
import com.waterbilling1.water_billing_system.entity.ApartmentAdmin;
import com.waterbilling1.water_billing_system.entity.ApartmentAdmin.ApprovalStatus;
import com.waterbilling1.water_billing_system.entity.DeletedApartmentLog;
import com.waterbilling1.water_billing_system.entity.HouseholdUser;
import com.waterbilling1.water_billing_system.entity.SuperAdmin;
import com.waterbilling1.water_billing_system.exception.DuplicateResourceException;
import com.waterbilling1.water_billing_system.exception.ResourceNotFoundException;
import com.waterbilling1.water_billing_system.exception.UnauthorizedException;
import com.waterbilling1.water_billing_system.repository.ApartmentAdminRepository;
import com.waterbilling1.water_billing_system.repository.DeletedApartmentLogRepository;
import com.waterbilling1.water_billing_system.repository.HouseholdUserRepository;
import com.waterbilling1.water_billing_system.repository.SuperAdminRepository;
import com.waterbilling1.water_billing_system.service.SuperAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.waterbilling1.water_billing_system.repository.MeterReadingRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SuperAdminServiceImpl implements SuperAdminService {

    private final ApartmentAdminRepository apartmentAdminRepository;
    private final HouseholdUserRepository householdUserRepository;
    private final SuperAdminRepository superAdminRepository;
    private final DeletedApartmentLogRepository deletedApartmentLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final MeterReadingRepository meterReadingRepository;

    @Override
    public List<ApartmentAdminSummaryResponse> getPendingApartmentAdmins() {
        return apartmentAdminRepository.findByStatus(ApprovalStatus.PENDING)
                .stream().map(this::toSummary).toList();
    }

    @Override
    public List<ApartmentAdminSummaryResponse> getAllApartmentAdmins() {
        return apartmentAdminRepository.findAll()
                .stream().map(this::toSummary).toList();
    }

    @Override
    @Transactional
    public ApprovalActionResponse approveApartmentAdmin(Long id) {
        ApartmentAdmin admin = apartmentAdminRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Apartment Admin not found with ID: " + id));
        admin.setStatus(ApprovalStatus.APPROVED);
        apartmentAdminRepository.save(admin);
        return ApprovalActionResponse.builder()
                .apartmentAdminId(admin.getId()).email(admin.getEmail())
                .status(admin.getStatus())
                .message("Apartment Admin approved successfully. They can now log in.")
                .build();
    }

    @Override
    @Transactional
    public ApprovalActionResponse rejectApartmentAdmin(Long id) {
        ApartmentAdmin admin = apartmentAdminRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Apartment Admin not found with ID: " + id));
        admin.setStatus(ApprovalStatus.REJECTED);
        apartmentAdminRepository.save(admin);
        return ApprovalActionResponse.builder()
                .apartmentAdminId(admin.getId()).email(admin.getEmail())
                .status(admin.getStatus())
                .message("Apartment Admin request rejected.")
                .build();
    }

    @Override
    public List<HouseholdUserSummaryResponse> getAllHouseholdUsers() {
        return householdUserRepository.findAll()
                .stream().map(this::toHouseholdSummary).toList();
    }

    @Override
    public SuperAdminProfileResponse getProfile(Long superAdminId) {
        SuperAdmin sa = superAdminRepository.findById(superAdminId)
                .orElseThrow(() -> new ResourceNotFoundException("Super Admin not found."));
        return toProfile(sa);
    }

    @Override
    @Transactional
    public SuperAdminProfileResponse updateProfile(Long superAdminId, UpdateProfileRequest request) {
        SuperAdmin sa = superAdminRepository.findById(superAdminId)
                .orElseThrow(() -> new ResourceNotFoundException("Super Admin not found."));

        if (!sa.getEmail().equalsIgnoreCase(request.getEmail())
                && superAdminRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("This email is already in use.");
        }

        sa.setFullName(request.getFullName());
        sa.setEmail(request.getEmail());
        superAdminRepository.save(sa);

        return toProfile(sa);
    }

    @Override
    @Transactional
    public void changePassword(Long superAdminId, ChangePasswordRequest request) {
        SuperAdmin sa = superAdminRepository.findById(superAdminId)
                .orElseThrow(() -> new ResourceNotFoundException("Super Admin not found."));

        if (!passwordEncoder.matches(request.getCurrentPassword(), sa.getPassword())) {
            throw new UnauthorizedException("Current password is incorrect.");
        }

        sa.setPassword(passwordEncoder.encode(request.getNewPassword()));
        superAdminRepository.save(sa);
    }

    @Override
    @Transactional
    public void deleteApartmentAdmin(Long apartmentAdminId) {
        ApartmentAdmin admin = apartmentAdminRepository.findById(apartmentAdminId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Apartment Admin not found with ID: " + apartmentAdminId));

        Long apartmentId = admin.getApartment().getId();
        List<HouseholdUser> households = householdUserRepository.findByApartment_Id(apartmentId);

        if (!households.isEmpty()) {
            throw new IllegalStateException(
                    "Cannot delete this apartment: " + households.size() +
                            " household user(s) are still registered under it. Remove them first.");
        }

        // Record the deletion before removing the row
        DeletedApartmentLog log = DeletedApartmentLog.builder()
                .adminFullName(admin.getFullName())
                .adminEmail(admin.getEmail())
                .apartmentName(admin.getApartment().getApartmentName())
                .city(admin.getApartment().getCity())
                .deletedAt(LocalDateTime.now())
                .build();
        deletedApartmentLogRepository.save(log);

        apartmentAdminRepository.delete(admin);
    }

    @Override
    public long getHouseholdsWithReadingsCount() {
        return meterReadingRepository.countDistinctHouseholdUsersWithReadings();
    }

    @Override
    public List<HouseholdUserSummaryResponse> getHouseholdsByApartment(Long apartmentId) {
        return householdUserRepository.findByApartment_Id(apartmentId)
                .stream().map(this::toHouseholdSummary).toList();
    }

    @Override
    public List<DeletedApartmentLogResponse> getDeletedApartmentLogs() {
        return deletedApartmentLogRepository.findAllByOrderByDeletedAtDesc()
                .stream()
                .map(l -> DeletedApartmentLogResponse.builder()
                        .id(l.getId())
                        .adminFullName(l.getAdminFullName())
                        .adminEmail(l.getAdminEmail())
                        .apartmentName(l.getApartmentName())
                        .city(l.getCity())
                        .deletedAt(l.getDeletedAt())
                        .build())
                .toList();
    }

    private SuperAdminProfileResponse toProfile(SuperAdmin sa) {
        return SuperAdminProfileResponse.builder()
                .id(sa.getId()).fullName(sa.getFullName()).email(sa.getEmail())
                .role(sa.getRole().getName().name())
                .build();
    }

    private ApartmentAdminSummaryResponse toSummary(ApartmentAdmin admin) {
        return ApartmentAdminSummaryResponse.builder()
                .id(admin.getId()).fullName(admin.getFullName()).email(admin.getEmail())
                .phoneNumber(admin.getPhoneNumber())
                .apartmentId(admin.getApartment().getId())
                .apartmentName(admin.getApartment().getApartmentName())
                .city(admin.getApartment().getCity()).state(admin.getApartment().getState())
                .status(admin.getStatus()).createdAt(admin.getCreatedAt())
                .build();
    }

    private HouseholdUserSummaryResponse toHouseholdSummary(HouseholdUser hu) {
        return HouseholdUserSummaryResponse.builder()
                .id(hu.getId()).fullName(hu.getFullName()).email(hu.getEmail())
                .phoneNumber(hu.getPhoneNumber()).flatNumber(hu.getFlatNumber())
                .status(hu.getStatus())
                .apartmentId(hu.getApartment().getId())
                .apartmentName(hu.getApartment().getApartmentName())
                .createdAt(hu.getCreatedAt())
                .build();
    }
}