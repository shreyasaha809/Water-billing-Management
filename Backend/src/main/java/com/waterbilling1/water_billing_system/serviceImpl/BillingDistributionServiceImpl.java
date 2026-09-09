package com.waterbilling1.water_billing_system.serviceImpl;

import com.waterbilling1.water_billing_system.dto.DistributionResult;
import com.waterbilling1.water_billing_system.entity.ApartmentAdmin;
import com.waterbilling1.water_billing_system.entity.HouseholdUser;
import com.waterbilling1.water_billing_system.entity.MeterReading;
import com.waterbilling1.water_billing_system.entity.WaterPurchase;
import com.waterbilling1.water_billing_system.exception.ResourceNotFoundException;
import com.waterbilling1.water_billing_system.repository.*;
import com.waterbilling1.water_billing_system.service.BillingDistributionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BillingDistributionServiceImpl implements BillingDistributionService {

    private final ApartmentAdminRepository apartmentAdminRepository;
    private final HouseholdUserRepository householdUserRepository;
    private final MeterReadingRepository meterReadingRepository;
    private final WaterPurchaseRepository waterPurchaseRepository;

    @Override
    @Transactional(readOnly = true, propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public List<DistributionResult> distributeCycleCost(Long apartmentAdminUserId, String billingCycle) {
        ApartmentAdmin admin = apartmentAdminRepository.findById(apartmentAdminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Apartment Admin not found."));
        Long apartmentId = admin.getApartment().getId();

        List<WaterPurchase> purchases = waterPurchaseRepository.findByApartment_IdAndBillingCycle(apartmentId, billingCycle);
        double totalCost = purchases.stream().mapToDouble(WaterPurchase::getTotalCost).sum();

        if (totalCost == 0.0) {
            throw new IllegalStateException("No water purchase records found for cycle " + billingCycle + ". Record a purchase first.");
        }

        List<HouseholdUser> households = householdUserRepository.findByApartment_Id(apartmentId).stream()
                .filter(h -> "ACTIVE".equals(h.getStatus()))
                .toList();

        // Sum metered usage per household for this cycle
        Map<Long, Double> usageByHousehold = households.stream().collect(Collectors.toMap(
                HouseholdUser::getId,
                h -> meterReadingRepository.findByHouseholdUser_IdAndBillingCycleOrderByReadingDateAsc(h.getId(), billingCycle)
                        .stream().mapToDouble(MeterReading::getUsageUnits).sum()
        ));

        double totalMeteredUsage = usageByHousehold.values().stream().mapToDouble(Double::doubleValue).sum();

        List<HouseholdUser> withReadings = households.stream().filter(h -> usageByHousehold.get(h.getId()) > 0).toList();
        List<HouseholdUser> withoutReadings = households.stream().filter(h -> usageByHousehold.get(h.getId()) == 0).toList();

        // Households without meters split a flat share of the remaining cost equally
        double flatSharePool = withoutReadings.isEmpty() ? 0.0 : totalCost * ((double) withoutReadings.size() / households.size());
        double proportionalPool = totalCost - flatSharePool;
        double flatSharePerHousehold = withoutReadings.isEmpty() ? 0.0 : flatSharePool / withoutReadings.size();

        return households.stream().map(h -> {
            double usage = usageByHousehold.get(h.getId());
            boolean hasReading = usage > 0;
            double allocated = hasReading
                    ? (totalMeteredUsage > 0 ? proportionalPool * (usage / totalMeteredUsage) : 0.0)
                    : flatSharePerHousehold;

            return DistributionResult.builder()
                    .householdUserId(h.getId())
                    .householdName(h.getFullName())
                    .flatNumber(h.getFlatNumber())
                    .meteredUsageLiters(usage)
                    .allocatedCost(Math.round(allocated * 100.0) / 100.0)
                    .allocationMethod(hasReading ? "PROPORTIONAL" : "FLAT_FALLBACK")
                    .build();
        }).toList();
    }
}