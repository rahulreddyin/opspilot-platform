package com.opspilot.platform.auth.controller;

import com.opspilot.platform.auth.dto.LoginRequest;
import com.opspilot.platform.auth.dto.LoginResponse;
import com.opspilot.platform.auth.dto.RegisterRequest;
import com.opspilot.platform.auth.dto.RegisterResponse;
import com.opspilot.platform.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public RegisterResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}