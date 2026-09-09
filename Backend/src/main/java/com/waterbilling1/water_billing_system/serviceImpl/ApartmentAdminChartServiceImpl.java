package com.waterbilling1.water_billing_system.serviceImpl;

import com.waterbilling1.water_billing_system.dto.HouseholdUsageBarPoint;
import com.waterbilling1.water_billing_system.entity.ApartmentAdmin;
import com.waterbilling1.water_billing_system.entity.HouseholdUser;
import com.waterbilling1.water_billing_system.entity.MeterReading;
import com.waterbilling1.water_billing_system.exception.ResourceNotFoundException;
import com.waterbilling1.water_billing_system.repository.ApartmentAdminRepository;
import com.waterbilling1.water_billing_system.repository.MeterReadingRepository;
import com.waterbilling1.water_billing_system.service.ApartmentAdminChartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApartmentAdminChartServiceImpl implements ApartmentAdminChartService {

    private final MeterReadingRepository meterReadingRepository;
    private final ApartmentAdminRepository apartmentAdminRepository;

    @Override
    public List<HouseholdUsageBarPoint> getHouseholdUsageComparison(Long apartmentAdminUserId) {
        ApartmentAdmin admin = apartmentAdminRepository.findById(apartmentAdminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Apartment Admin not found."));

        List<MeterReading> apartmentReadings = meterReadingRepository
                .findByApartment_IdOrderByReadingDateDesc(admin.getApartment().getId());

        if (apartmentReadings.isEmpty()) {
            return List.of();
        }

        String currentCycle = apartmentReadings.get(0).getBillingCycle();

        List<MeterReading> cycleReadings = apartmentReadings.stream()
                .filter(r -> currentCycle.equals(r.getBillingCycle()))
                .collect(Collectors.toList());

        Map<HouseholdUser, Double> usageByHousehold = cycleReadings.stream()
                .collect(Collectors.groupingBy(
                        MeterReading::getHouseholdUser,
                        Collectors.summingDouble(MeterReading::getUsageUnits)
                ));

        double average = usageByHousehold.values().stream()
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0.0);

        double max = usageByHousehold.values().stream()
                .mapToDouble(Double::doubleValue)
                .max()
                .orElse(0.0);

        return usageByHousehold.entrySet().stream()
                .map(entry -> {
                    double usage = entry.getValue();
                    String status;
                    if (usage == max) {
                        status = "HIGHEST";
                    } else if (usage > average) {
                        status = "ABOVE_AVERAGE";
                    } else {
                        status = "NORMAL";
                    }
                    return HouseholdUsageBarPoint.builder()
                            .household(entry.getKey().getFlatNumber())
                            .usage(Math.round(usage * 100.0) / 100.0)
                            .colorStatus(status)
                            .build();
                })
                .sorted(Comparator.comparing(HouseholdUsageBarPoint::getHousehold))
                .collect(Collectors.toList());
    }
}