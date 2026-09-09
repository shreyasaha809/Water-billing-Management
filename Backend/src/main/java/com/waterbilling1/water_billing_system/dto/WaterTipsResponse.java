package com.waterbilling1.water_billing_system.dto;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WaterTipsResponse {
    private String dailyTip;
    private String seasonalTip;
    private String emergencyTip;
    private List<String> personalizedTips;
}