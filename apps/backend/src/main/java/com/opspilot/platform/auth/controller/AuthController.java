package com.opspilot.platform.auth.controller;

import com.opspilot.platform.auth.dto.LoginRequest;
import com.opspilot.platform.auth.dto.LoginResponse;
import com.opspilot.platform.auth.service.AuthService;
import com.opspilot.platform.dto.AuthResponse;
import com.opspilot.platform.dto.ResendRegistrationOtpRequest;
import com.opspilot.platform.dto.StartRegistrationRequest;
import com.opspilot.platform.dto.VerifyRegistrationOtpRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody StartRegistrationRequest request) {
        return authService.register(request);
    }

    @PostMapping("/register/verify-otp")
    public AuthResponse verifyRegistrationOtp(@Valid @RequestBody VerifyRegistrationOtpRequest request) {
        return authService.verifyRegistrationOtp(request);
    }

    @PostMapping("/register/resend-otp")
    public AuthResponse resendRegistrationOtp(@Valid @RequestBody ResendRegistrationOtpRequest request) {
        return authService.resendRegistrationOtp(request);
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}