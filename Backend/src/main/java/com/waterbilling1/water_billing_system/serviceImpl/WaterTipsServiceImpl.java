package com.waterbilling1.water_billing_system.serviceImpl;

import com.waterbilling1.water_billing_system.dto.WaterTipsResponse;
import com.waterbilling1.water_billing_system.entity.HouseholdUser;
import com.waterbilling1.water_billing_system.entity.MeterReading;
import com.waterbilling1.water_billing_system.exception.ResourceNotFoundException;
import com.waterbilling1.water_billing_system.repository.HouseholdUserRepository;
import com.waterbilling1.water_billing_system.repository.MeterReadingRepository;
import com.waterbilling1.water_billing_system.service.WaterTipsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Month;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WaterTipsServiceImpl implements WaterTipsService {

    private final HouseholdUserRepository householdUserRepository;
    private final MeterReadingRepository meterReadingRepository;

    private static final List<String> DAILY_TIPS = List.of(
            "Turn off the tap while brushing your teeth — saves up to 8 liters per session.",
            "Fix dripping taps promptly — a single drip can waste over 20 liters a day.",
            "Run washing machines and dishwashers only with full loads.",
            "Take shorter showers — cutting 2 minutes can save up to 20 liters.",
            "Use a bucket instead of a hose when washing your vehicle.",
            "Reuse water from rinsing vegetables to water your plants.",
            "Install aerators on taps to reduce flow without losing pressure."
    );

    private static final List<String> EMERGENCY_TIPS = List.of(
            "If you notice a sudden spike in usage, check for hidden leaks in toilets and pipework immediately.",
            "During water supply interruptions, store water in clean, covered containers and avoid overuse.",
            "In case of a burst pipe, shut off your main water valve immediately and contact your Apartment Admin."
    );

    @Override
    public WaterTipsResponse getTipsForHousehold(Long householdUserId) {
        HouseholdUser household = householdUserRepository.findById(householdUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Household user not found."));

        int dayOfYear = LocalDate.now().getDayOfYear();
        String dailyTip = DAILY_TIPS.get(dayOfYear % DAILY_TIPS.size());
        String emergencyTip = EMERGENCY_TIPS.get(dayOfYear % EMERGENCY_TIPS.size());

        Month currentMonth = LocalDate.now().getMonth();
        String seasonalTip = getSeasonalTip(currentMonth);

        List<String> personalized = buildPersonalizedTips(household.getId());

        return WaterTipsResponse.builder()
                .dailyTip(dailyTip)
                .seasonalTip(seasonalTip)
                .emergencyTip(emergencyTip)
                .personalizedTips(personalized)
                .build();
    }

    private String getSeasonalTip(Month month) {
        return switch (month) {
            case MARCH, APRIL, MAY, JUNE -> "Summer tip: Water plants early morning or late evening to reduce evaporation loss.";
            case JULY, AUGUST, SEPTEMBER -> "Monsoon tip: Consider rainwater harvesting to reduce dependency on stored/purchased water.";
            case OCTOBER, NOVEMBER -> "Post-monsoon tip: Check your storage tanks for sediment buildup and clean if needed.";
            default -> "Winter tip: Insulate exposed pipes to prevent freezing-related leaks and wastage.";
        };
    }

    private List<String> buildPersonalizedTips(Long householdUserId) {
        List<String> tips = new ArrayList<>();

        List<MeterReading> history = meterReadingRepository.findByHouseholdUser_IdOrderByReadingDateDesc(householdUserId);

        if (history.size() < 2) {
            tips.add("Keep recording your meter readings regularly to unlock personalized usage insights.");
            return tips;
        }

        double latest = history.get(0).getUsageUnits();
        double previous = history.get(1).getUsageUnits();

        if (previous > 0) {
            double percentChange = ((latest - previous) / previous) * 100;
            if (percentChange > 10) {
                tips.add(String.format("You used %.0f%% more water than your last reading. Consider reducing shower time or checking for leaks.", percentChange));
            } else if (percentChange < -10) {
                tips.add(String.format("Great job! Your usage dropped %.0f%% compared to your last reading. Keep it up.", Math.abs(percentChange)));
            }
        }

        double average = history.stream().mapToDouble(MeterReading::getUsageUnits).average().orElse(0);
        if (latest > average * 1.3) {
            tips.add("Your latest usage is well above your average — check for dripping taps or running toilets.");
        }

        if (tips.isEmpty()) {
            tips.add("Your water usage looks stable and consistent — nice work maintaining efficient habits.");
        }

        return tips;
    }
}