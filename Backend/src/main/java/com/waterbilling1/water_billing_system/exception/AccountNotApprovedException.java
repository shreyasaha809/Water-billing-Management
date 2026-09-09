package com.waterbilling1.water_billing_system.exception;

public class AccountNotApprovedException extends RuntimeException {
    public AccountNotApprovedException(String message) { super(message); }
}