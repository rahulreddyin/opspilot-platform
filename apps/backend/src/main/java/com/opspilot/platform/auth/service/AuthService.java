package com.opspilot.platform.auth.service;

import com.opspilot.platform.auth.dto.LoginRequest;
import com.opspilot.platform.auth.dto.LoginResponse;
import com.opspilot.platform.domain.Role;
import com.opspilot.platform.domain.User;
import com.opspilot.platform.dto.AuthResponse;
import com.opspilot.platform.dto.ResendRegistrationOtpRequest;
import com.opspilot.platform.dto.StartRegistrationRequest;
import com.opspilot.platform.dto.VerifyRegistrationOtpRequest;
import com.opspilot.platform.repository.UserRepository;
import com.opspilot.platform.security.JwtService;
import com.opspilot.platform.service.RegistrationOtpService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final RegistrationOtpService registrationOtpService;

    public AuthService(UserRepository userRepository,
                       JwtService jwtService,
                       AuthenticationManager authenticationManager,
                       RegistrationOtpService registrationOtpService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.registrationOtpService = registrationOtpService;
    }

    public AuthResponse register(StartRegistrationRequest request) {
        registrationOtpService.startRegistration(request);

        return new AuthResponse(
                null,
                normalizeEmail(request.getEmail()),
                "USER",
                "OTP sent to your email. Please verify to complete registration."
        );
    }

    public AuthResponse verifyRegistrationOtp(VerifyRegistrationOtpRequest request) {
        User savedUser = registrationOtpService.verifyRegistrationOtp(request);

        return new AuthResponse(
                null,
                savedUser.getEmail(),
                "USER",
                "Registration successful. Please login."
        );
    }

    public AuthResponse resendRegistrationOtp(ResendRegistrationOtpRequest request) {
        registrationOtpService.resendOtp(request);

        return new AuthResponse(
                null,
                normalizeEmail(request.getEmail()),
                "USER",
                "A new OTP has been sent to your email."
        );
    }

    public LoginResponse login(LoginRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!user.isVerified()) {
            throw new IllegalArgumentException("Please verify your email before logging in");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        normalizedEmail,
                        request.getPassword()
                )
        );

        String primaryRole = user.getRoles().stream()
                .findFirst()
                .map(Role::name)
                .orElse("USER");

        String jwtToken = jwtService.generateToken(
                user.getEmail(),
                user.getRoles().stream()
                        .map(Enum::name)
                        .toList()
        );

        return new LoginResponse(
                jwtToken,
                user.getEmail(),
                primaryRole,
                "Login successful"
        );
    }

    private String normalizeEmail(String email) {
        if (email == null || email.trim().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        return email.trim().toLowerCase();
    }
}