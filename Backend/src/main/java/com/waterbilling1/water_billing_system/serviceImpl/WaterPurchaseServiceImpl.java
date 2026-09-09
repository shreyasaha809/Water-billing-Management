package com.waterbilling1.water_billing_system.serviceImpl;

import com.waterbilling1.water_billing_system.dto.RecordWaterPurchaseRequest;
import com.waterbilling1.water_billing_system.dto.WaterPurchaseResponse;
import com.waterbilling1.water_billing_system.entity.ApartmentAdmin;
import com.waterbilling1.water_billing_system.entity.WaterPurchase;
import com.waterbilling1.water_billing_system.exception.ResourceNotFoundException;
import com.waterbilling1.water_billing_system.repository.ApartmentAdminRepository;
import com.waterbilling1.water_billing_system.repository.WaterPurchaseRepository;
import com.waterbilling1.water_billing_system.service.WaterPurchaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WaterPurchaseServiceImpl implements WaterPurchaseService {

    private final WaterPurchaseRepository waterPurchaseRepository;
    private final ApartmentAdminRepository apartmentAdminRepository;

    @Override
    @Transactional
    public WaterPurchaseResponse recordPurchase(Long apartmentAdminUserId, RecordWaterPurchaseRequest request) {
        ApartmentAdmin admin = apartmentAdminRepository.findById(apartmentAdminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Apartment Admin not found."));

        double totalCost = request.getVolumePurchasedLiters() * request.getUnitCost();

        WaterPurchase purchase = WaterPurchase.builder()
                .apartment(admin.getApartment())
                .billingCycle(request.getBillingCycle())
                .sourceType(request.getSourceType())
                .volumePurchasedLiters(request.getVolumePurchasedLiters())
                .unitCost(request.getUnitCost())
                .totalCost(totalCost)
                .purchaseDate(request.getPurchaseDate())
                .build();

        return toResponse(waterPurchaseRepository.save(purchase));
    }

    @Override
    public List<WaterPurchaseResponse> getPurchasesForAdmin(Long apartmentAdminUserId) {
        ApartmentAdmin admin = apartmentAdminRepository.findById(apartmentAdminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Apartment Admin not found."));

        return waterPurchaseRepository.findByApartment_IdOrderByPurchaseDateDesc(admin.getApartment().getId())
                .stream().map(this::toResponse).toList();
    }

    private WaterPurchaseResponse toResponse(WaterPurchase p) {
        return WaterPurchaseResponse.builder()
                .id(p.getId()).billingCycle(p.getBillingCycle()).sourceType(p.getSourceType())
                .volumePurchasedLiters(p.getVolumePurchasedLiters()).unitCost(p.getUnitCost())
                .totalCost(p.getTotalCost()).purchaseDate(p.getPurchaseDate())
                .build();
    }
}