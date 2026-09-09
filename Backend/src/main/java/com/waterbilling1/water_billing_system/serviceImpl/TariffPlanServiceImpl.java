package com.waterbilling1.water_billing_system.serviceImpl;

import com.waterbilling1.water_billing_system.dto.TariffPlanRequest;
import com.waterbilling1.water_billing_system.dto.TariffPlanResponse;
import com.waterbilling1.water_billing_system.entity.Apartment;
import com.waterbilling1.water_billing_system.entity.ApartmentAdmin;
import com.waterbilling1.water_billing_system.entity.TariffPlan;
import com.waterbilling1.water_billing_system.exception.ResourceNotFoundException;
import com.waterbilling1.water_billing_system.repository.ApartmentAdminRepository;
import com.waterbilling1.water_billing_system.repository.TariffPlanRepository;
import com.waterbilling1.water_billing_system.service.TariffPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TariffPlanServiceImpl implements TariffPlanService {

    private final TariffPlanRepository tariffPlanRepository;
    private final ApartmentAdminRepository apartmentAdminRepository;

    @Override
    public TariffPlanResponse getTariffPlan(Long apartmentAdminUserId) {
        ApartmentAdmin admin = apartmentAdminRepository.findById(apartmentAdminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Apartment Admin not found."));
        TariffPlan plan = getOrCreateDefault(admin.getApartment().getId());
        return toResponse(plan);
    }

    @Override
    @Transactional
    public TariffPlanResponse updateTariffPlan(Long apartmentAdminUserId, TariffPlanRequest request) {
        ApartmentAdmin admin = apartmentAdminRepository.findById(apartmentAdminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Apartment Admin not found."));
        TariffPlan plan = getOrCreateDefault(admin.getApartment().getId());

        plan.setBaseTierLimitLiters(request.getBaseTierLimitLiters());
        plan.setBaseRate(request.getBaseRate());
        plan.setHigherRate(request.getHigherRate());
        plan.setLateFeeAmount(request.getLateFeeAmount());
        plan.setLateFeeIntervalDays(request.getLateFeeIntervalDays());

        return toResponse(tariffPlanRepository.save(plan));
    }

    @Override
    @Transactional
    public TariffPlan getOrCreateDefault(Long apartmentId) {
        return tariffPlanRepository.findByApartment_Id(apartmentId)
                .orElseGet(() -> tariffPlanRepository.save(
                        TariffPlan.builder()
                                .apartment(Apartment.builder().id(apartmentId).build())
                                .build()
                ));
    }

    private TariffPlanResponse toResponse(TariffPlan p) {
        return TariffPlanResponse.builder()
                .id(p.getId())
                .baseTierLimitLiters(p.getBaseTierLimitLiters())
                .baseRate(p.getBaseRate())
                .higherRate(p.getHigherRate())
                .lateFeeAmount(p.getLateFeeAmount())
                .lateFeeIntervalDays(p.getLateFeeIntervalDays())
                .build();
    }
}