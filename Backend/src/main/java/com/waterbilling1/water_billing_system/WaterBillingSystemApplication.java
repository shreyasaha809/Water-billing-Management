package com.waterbilling1.water_billing_system;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class WaterBillingSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(WaterBillingSystemApplication.class, args);
	}

}
