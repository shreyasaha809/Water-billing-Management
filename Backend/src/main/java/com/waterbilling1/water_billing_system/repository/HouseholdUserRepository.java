package com.waterbilling1.water_billing_system.repository;

import com.waterbilling1.water_billing_system.entity.HouseholdUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HouseholdUserRepository extends JpaRepository<HouseholdUser, Long> {

    Optional<HouseholdUser> findByEmail(String email);

    boolean existsByEmail(String email);

    List<HouseholdUser> findByApartment_Id(Long apartmentId);

    List<HouseholdUser> findByApartment_IdAndStatus(Long apartmentId, String status);

    Optional<HouseholdUser> findByIdAndApartment_Id(Long id, Long apartmentId);
}