package com.waterbilling1.water_billing_system.repository;

import com.waterbilling1.water_billing_system.entity.Role;
import com.waterbilling1.water_billing_system.entity.Role.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(RoleName name);
    boolean existsByName(RoleName name);
}