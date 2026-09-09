package com.waterbilling1.water_billing_system.serviceImpl;

import com.waterbilling1.water_billing_system.dto.*;
import com.waterbilling1.water_billing_system.entity.Apartment;
import com.waterbilling1.water_billing_system.entity.ApartmentAdmin;
import com.waterbilling1.water_billing_system.entity.Role;
import com.waterbilling1.water_billing_system.entity.Role.RoleName;
import com.waterbilling1.water_billing_system.exception.*;
import com.waterbilling1.water_billing_system.repository.ApartmentAdminRepository;
import com.waterbilling1.water_billing_system.repository.RoleRepository;
import com.waterbilling1.water_billing_system.security.CustomUserDetails;
import com.waterbilling1.water_billing_system.service.AuthService;
import com.waterbilling1.water_billing_system.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final ApartmentAdminRepository apartmentAdminRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    @Override
    public RegisterApartmentAdminResponse registerApartmentAdmin(RegisterApartmentAdminRequest request) {

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new PasswordMismatchException("Password and Confirm Password do not match.");
        }

        if (apartmentAdminRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("An account with this email already exists.");
        }

        Role adminRole = roleRepository.findByName(RoleName.APARTMENT_ADMIN)
                .orElseThrow(() -> new ResourceNotFoundException("APARTMENT_ADMIN role not found. Please seed roles first."));

        Apartment apartment = Apartment.builder()
                .apartmentName(request.getApartmentName())
                .address(request.getApartmentAddress())
                .city(request.getCity())
                .state(request.getState())
                .pinCode(request.getPinCode())
                .build();

        ApartmentAdmin admin = ApartmentAdmin.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .password(passwordEncoder.encode(request.getPassword()))
                .status(ApartmentAdmin.ApprovalStatus.PENDING)
                .apartment(apartment)
                .role(adminRole)
                .build();

        apartment.setApartmentAdmin(admin);

        ApartmentAdmin saved = apartmentAdminRepository.save(admin);

        return RegisterApartmentAdminResponse.builder()
                .apartmentAdminId(saved.getId())
                .fullName(saved.getFullName())
                .email(saved.getEmail())
                .apartmentName(saved.getApartment().getApartmentName())
                .status(saved.getStatus())
                .message("Registration submitted successfully. Awaiting Super Admin approval.")
                .registeredAt(saved.getCreatedAt())
                .build();
    }

    @Override
    public LoginResponse login(LoginRequest request) {

        Authentication authentication;

        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (DisabledException ex) {
            ApartmentAdmin admin = apartmentAdminRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new UnauthorizedException("Invalid email or password."));

            if (admin.getStatus() == ApartmentAdmin.ApprovalStatus.PENDING) {
                throw new AccountNotApprovedException("Your registration request is still pending approval.");
            } else {
                throw new AccountNotApprovedException("Your registration request has been rejected.");
            }
        }

        CustomUserDetails principal = (CustomUserDetails) authentication.getPrincipal();

        String token = jwtUtil.generateToken(principal.getUsername(), principal.getId(), principal.getRole());

        return LoginResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(principal.getId())
                .fullName(principal.getFullName())
                .email(principal.getUsername())
                .role(principal.getRole())
                .mustChangePassword(principal.isMustChangePassword())
                .build();
    }
}