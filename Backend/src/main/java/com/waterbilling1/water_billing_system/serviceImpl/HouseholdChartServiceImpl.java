package com.waterbilling1.water_billing_system.serviceImpl;

import com.waterbilling1.water_billing_system.dto.DailyUsagePoint;
import com.waterbilling1.water_billing_system.dto.MonthlyUsagePoint;
import com.waterbilling1.water_billing_system.dto.UsageComparisonResponse;
import com.waterbilling1.water_billing_system.entity.HouseholdUser;
import com.waterbilling1.water_billing_system.entity.MeterReading;
import com.waterbilling1.water_billing_system.exception.ResourceNotFoundException;
import com.waterbilling1.water_billing_system.repository.HouseholdUserRepository;
import com.waterbilling1.water_billing_system.repository.MeterReadingRepository;
import com.waterbilling1.water_billing_system.service.HouseholdChartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HouseholdChartServiceImpl implements HouseholdChartService {

    private final MeterReadingRepository meterReadingRepository;
    private final HouseholdUserRepository householdUserRepository;

    @Override
    public List<DailyUsagePoint> getDailyUsage(Long householdUserId) {
        List<MeterReading> readings = meterReadingRepository
                .findByHouseholdUser_IdOrderByReadingDateDesc(householdUserId);

        List<MeterReading> last30 = readings.stream().limit(30).collect(Collectors.toList());
        Collections.reverse(last30); // ascending order for chart

        return last30.stream()
                .map(r -> DailyUsagePoint.builder()
                        .date(r.getReadingDate().toString())
                        .usage(r.getUsageUnits())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<MonthlyUsagePoint> getMonthlyUsage(Long householdUserId) {
        List<MeterReading> readings = meterReadingRepository
                .findByHouseholdUser_IdOrderByReadingDateDesc(householdUserId);

        Map<YearMonth, Double> monthlyTotals = readings.stream()
                .collect(Collectors.groupingBy(
                        r -> YearMonth.from(r.getReadingDate()),
                        Collectors.summingDouble(MeterReading::getUsageUnits)
                ));

        List<YearMonth> sortedMonths = monthlyTotals.keySet().stream()
                .sorted()
                .collect(Collectors.toList());

        List<YearMonth> last12 = sortedMonths.stream()
                .skip(Math.max(0, sortedMonths.size() - 12))
                .collect(Collectors.toList());

        return last12.stream()
                .map(ym -> MonthlyUsagePoint.builder()
                        .month(ym.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH))
                        .usage(monthlyTotals.get(ym))
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public UsageComparisonResponse getUsageComparison(Long householdUserId) {
        HouseholdUser household = householdUserRepository.findById(householdUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Household user not found."));

        List<MeterReading> householdReadings = meterReadingRepository
                .findByHouseholdUser_IdOrderByReadingDateDesc(householdUserId);

        if (householdReadings.isEmpty()) {
            return UsageComparisonResponse.builder()
                    .userUsage(0.0).averageUsage(0.0).difference(0.0).percentage(0.0)
                    .status("NORMAL").build();
        }

        String currentCycle = householdReadings.get(0).getBillingCycle();

        double userUsage = householdReadings.stream()
                .filter(r -> currentCycle.equals(r.getBillingCycle()))
                .mapToDouble(MeterReading::getUsageUnits)
                .sum();

        List<MeterReading> apartmentReadings = meterReadingRepository
                .findByApartment_IdOrderByReadingDateDesc(household.getApartment().getId());

        Map<Long, Double> usagePerHousehold = apartmentReadings.stream()
                .filter(r -> currentCycle.equals(r.getBillingCycle()))
                .collect(Collectors.groupingBy(
                        r -> r.getHouseholdUser().getId(),
                        Collectors.summingDouble(MeterReading::getUsageUnits)
                ));

        double averageUsage = usagePerHousehold.values().stream()
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0.0);

        double difference = userUsage - averageUsage;
        double percentage = averageUsage > 0 ? Math.round((difference / averageUsage) * 100.0) : 0.0;
        String status = difference > 0 ? "ABOVE_AVERAGE" : difference < 0 ? "BELOW_AVERAGE" : "NORMAL";

        return UsageComparisonResponse.builder()
                .userUsage(Math.round(userUsage * 100.0) / 100.0)
                .averageUsage(Math.round(averageUsage * 100.0) / 100.0)
                .difference(Math.round(difference * 100.0) / 100.0)
                .percentage(Math.abs(percentage))
                .status(status)
                .build();
    }
}