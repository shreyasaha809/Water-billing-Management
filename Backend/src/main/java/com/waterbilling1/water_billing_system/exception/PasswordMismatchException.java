package com.waterbilling1.water_billing_system.exception;

public class PasswordMismatchException extends RuntimeException {
    public PasswordMismatchException(String message) { super(message); }
}