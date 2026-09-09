package com.waterbilling1.water_billing_system.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder().success(true).message(message).data(data).build();
    }
    public static <T> ApiResponse<T> success(String message) {
        return ApiResponse.<T>builder().success(true).message(message).build();
    }
    public static <T> ApiResponse<T> failure(String message) {
        return ApiResponse.<T>builder().success(false).message(message).build();
    }
}