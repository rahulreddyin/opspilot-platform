package com.opspilot.platform.service;

import com.opspilot.platform.domain.PendingRegistration;
import com.opspilot.platform.domain.Role;
import com.opspilot.platform.domain.User;
import com.opspilot.platform.dto.ResendRegistrationOtpRequest;
import com.opspilot.platform.dto.StartRegistrationRequest;
import com.opspilot.platform.dto.VerifyRegistrationOtpRequest;
import com.opspilot.platform.repository.PendingRegistrationRepository;
import com.opspilot.platform.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Set;

@Service
@Transactional
public class RegistrationOtpService {

    private static final int MAX_VERIFY_ATTEMPTS = 5;
    private static final int MAX_RESEND_ATTEMPTS = 5;
    private static final long OTP_EXPIRY_MINUTES = 10;

    private final PendingRegistrationRepository pendingRegistrationRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public RegistrationOtpService(PendingRegistrationRepository pendingRegistrationRepository,
                                  UserRepository userRepository,
                                  PasswordEncoder passwordEncoder,
                                  EmailService emailService) {
        this.pendingRegistrationRepository = pendingRegistrationRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    public void startRegistration(StartRegistrationRequest request) {
        cleanupExpiredPendingRegistrations();

        String normalizedEmail = normalizeEmail(request.getEmail());
        String normalizedName = normalizeName(request.getName());
        validatePassword(request.getPassword());

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new IllegalArgumentException("An account with this email already exists");
        }

        PendingRegistration pendingRegistration = pendingRegistrationRepository
                .findByEmailIgnoreCase(normalizedEmail)
                .orElseGet(PendingRegistration::new);

        pendingRegistration.setName(normalizedName);
        pendingRegistration.setEmail(normalizedEmail);
        pendingRegistration.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        pendingRegistration.setOtpCode(generateOtp());
        pendingRegistration.setOtpExpiryAt(Instant.now().plus(OTP_EXPIRY_MINUTES, ChronoUnit.MINUTES));
        pendingRegistration.setAttemptCount(0);

        if (pendingRegistration.getCreatedAt() == null) {
            pendingRegistration.setCreatedAt(Instant.now());
            pendingRegistration.setResendCount(0);
        }

        pendingRegistration.setUpdatedAt(Instant.now());
        pendingRegistrationRepository.save(pendingRegistration);

        sendOtpEmail(normalizedEmail, pendingRegistration.getOtpCode());
    }

    public User verifyRegistrationOtp(VerifyRegistrationOtpRequest request) {
        cleanupExpiredPendingRegistrations();

        String normalizedEmail = normalizeEmail(request.getEmail());
        String otpCode = normalizeOtp(request.getOtpCode());

        PendingRegistration pendingRegistration = pendingRegistrationRepository
                .findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("No pending registration found for this email"));

        if (pendingRegistration.getAttemptCount() >= MAX_VERIFY_ATTEMPTS) {
            throw new IllegalArgumentException("Too many invalid attempts. Please restart registration");
        }

        if (pendingRegistration.getOtpExpiryAt().isBefore(Instant.now())) {
            pendingRegistrationRepository.deleteByEmailIgnoreCase(normalizedEmail);
            throw new IllegalArgumentException("OTP has expired. Please restart registration");
        }

        if (!pendingRegistration.getOtpCode().equals(otpCode)) {
            pendingRegistration.setAttemptCount(pendingRegistration.getAttemptCount() + 1);
            pendingRegistration.setUpdatedAt(Instant.now());
            pendingRegistrationRepository.save(pendingRegistration);

            if (pendingRegistration.getAttemptCount() >= MAX_VERIFY_ATTEMPTS) {
                throw new IllegalArgumentException("Too many invalid attempts. Please restart registration");
            }

            throw new IllegalArgumentException("Invalid OTP");
        }

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            pendingRegistrationRepository.deleteByEmailIgnoreCase(normalizedEmail);
            throw new IllegalArgumentException("An account with this email already exists");
        }

        User user = new User();
        user.setName(pendingRegistration.getName());
        user.setEmail(pendingRegistration.getEmail());
        user.setPasswordHash(pendingRegistration.getPasswordHash());
        user.setCreatedAt(Instant.now());
        user.setVerified(true);
        user.setRoles(Set.of(Role.USER));

        User savedUser = userRepository.save(user);
        pendingRegistrationRepository.deleteByEmailIgnoreCase(normalizedEmail);

        return savedUser;
    }

    public void resendOtp(ResendRegistrationOtpRequest request) {
        cleanupExpiredPendingRegistrations();

        String normalizedEmail = normalizeEmail(request.getEmail());

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new IllegalArgumentException("An account with this email already exists");
        }

        PendingRegistration pendingRegistration = pendingRegistrationRepository
                .findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("No pending registration found for this email"));

        if (pendingRegistration.getResendCount() >= MAX_RESEND_ATTEMPTS) {
            throw new IllegalArgumentException("Maximum resend limit reached. Please restart registration");
        }

        pendingRegistration.setOtpCode(generateOtp());
        pendingRegistration.setOtpExpiryAt(Instant.now().plus(OTP_EXPIRY_MINUTES, ChronoUnit.MINUTES));
        pendingRegistration.setResendCount(pendingRegistration.getResendCount() + 1);
        pendingRegistration.setAttemptCount(0);
        pendingRegistration.setUpdatedAt(Instant.now());

        pendingRegistrationRepository.save(pendingRegistration);
        sendOtpEmail(normalizedEmail, pendingRegistration.getOtpCode());
    }

    private void cleanupExpiredPendingRegistrations() {
        pendingRegistrationRepository.deleteByOtpExpiryAtBefore(Instant.now());
    }

    private void sendOtpEmail(String email, String otpCode) {
        String subject = "Your OpsPilot verification code";
        String body = """
                Your OpsPilot verification code is: %s

                This code will expire in 10 minutes.

                If you did not try to register, you can ignore this email.
                """.formatted(otpCode);

        emailService.sendSimpleEmail(email, subject, body);
    }

    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        int value = 100000 + random.nextInt(900000);
        return String.valueOf(value);
    }

    private String normalizeEmail(String email) {
        if (email == null || email.trim().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        return email.trim().toLowerCase();
    }

    private String normalizeName(String name) {
        if (name == null || name.trim().isBlank()) {
            throw new IllegalArgumentException("Name is required");
        }
        return name.trim();
    }

    private String normalizeOtp(String otpCode) {
        if (otpCode == null || otpCode.trim().isBlank()) {
            throw new IllegalArgumentException("OTP is required");
        }
        return otpCode.trim();
    }

    private void validatePassword(String password) {
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }

        if (password.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters long");
        }
    }
}