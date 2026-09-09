package com.waterbilling1.water_billing_system.config;

import com.waterbilling1.water_billing_system.entity.Role;
import com.waterbilling1.water_billing_system.entity.Role.RoleName;
import com.waterbilling1.water_billing_system.entity.SuperAdmin;
import com.waterbilling1.water_billing_system.repository.RoleRepository;
import com.waterbilling1.water_billing_system.repository.SuperAdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final SuperAdminRepository superAdminRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        for (RoleName name : RoleName.values()) {
            if (!roleRepository.existsByName(name)) {
                roleRepository.save(Role.builder().name(name).build());
            }
        }

        Role superAdminRole = roleRepository.findByName(RoleName.SUPER_ADMIN).orElseThrow();

        if (!superAdminRepository.existsByEmail("admin@watersystem.com")) {
            SuperAdmin superAdmin = SuperAdmin.builder()
                    .fullName("System Super Admin")
                    .email("admin@watersystem.com")
                    .password(passwordEncoder.encode("Admin@123"))
                    .role(superAdminRole)
                    .build();
            superAdminRepository.save(superAdmin);
            System.out.println("Seeded Super Admin -> email: admin@watersystem.com / password: Admin@123");
        }
    }
}