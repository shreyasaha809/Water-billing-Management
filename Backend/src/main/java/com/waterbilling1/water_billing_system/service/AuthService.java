package com.waterbilling1.water_billing_system.service;

import com.waterbilling1.water_billing_system.dto.LoginRequest;
import com.waterbilling1.water_billing_system.dto.LoginResponse;
import com.waterbilling1.water_billing_system.dto.RegisterApartmentAdminRequest;
import com.waterbilling1.water_billing_system.dto.RegisterApartmentAdminResponse;

public interface AuthService {

    RegisterApartmentAdminResponse registerApartmentAdmin(RegisterApartmentAdminRequest request);

    LoginResponse login(LoginRequest request);
}