package com.waterbilling1.water_billing_system.security;

import org.springframework.transaction.annotation.Transactional;
import com.waterbilling1.water_billing_system.entity.ApartmentAdmin;
import com.waterbilling1.water_billing_system.entity.HouseholdUser;
import com.waterbilling1.water_billing_system.entity.SuperAdmin;
import com.waterbilling1.water_billing_system.repository.ApartmentAdminRepository;
import com.waterbilling1.water_billing_system.repository.HouseholdUserRepository;
import com.waterbilling1.water_billing_system.repository.SuperAdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final SuperAdminRepository superAdminRepository;
    private final ApartmentAdminRepository apartmentAdminRepository;
    private final HouseholdUserRepository householdUserRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

        Optional<SuperAdmin> superAdmin = superAdminRepository.findByEmail(email);
        if (superAdmin.isPresent()) {
            SuperAdmin sa = superAdmin.get();
            return new CustomUserDetails(sa.getId(), sa.getEmail(), sa.getPassword(),
                    sa.getRole().getName().name(), sa.getFullName(), true, false);
        }

        Optional<ApartmentAdmin> apartmentAdmin = apartmentAdminRepository.findByEmail(email);
        if (apartmentAdmin.isPresent()) {
            ApartmentAdmin aa = apartmentAdmin.get();
            boolean isApproved = aa.getStatus() == ApartmentAdmin.ApprovalStatus.APPROVED;
            return new CustomUserDetails(aa.getId(), aa.getEmail(), aa.getPassword(),
                    aa.getRole().getName().name(), aa.getFullName(), isApproved, false);
        }

        Optional<HouseholdUser> householdUser = householdUserRepository.findByEmail(email);
        if (householdUser.isPresent()) {
            HouseholdUser hu = householdUser.get();
            boolean isActive = "ACTIVE".equals(hu.getStatus());
            return new CustomUserDetails(hu.getId(), hu.getEmail(), hu.getPassword(),
                    hu.getRole().getName().name(), hu.getFullName(), isActive, hu.isMustChangePassword());
        }
        throw new UsernameNotFoundException("No account found with email: " + email);
    }
}