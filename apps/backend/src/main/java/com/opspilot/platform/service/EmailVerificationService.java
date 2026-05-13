package com.opspilot.platform.service;

import com.opspilot.platform.domain.EmailVerificationToken;
import com.opspilot.platform.domain.User;
import com.opspilot.platform.dto.ResendVerificationRequest;
import com.opspilot.platform.repository.EmailVerificationTokenRepository;
import com.opspilot.platform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class EmailVerificationService {


    private final EmailVerificationTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Value("${app.email-verification.base-url:http://localhost:8080}")
    private String baseUrl;

    public EmailVerificationService(EmailVerificationTokenRepository tokenRepository,
                                    UserRepository userRepository,
                                    EmailService emailService) {
        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    public void createAndSendVerificationToken(User user) {
        tokenRepository.deleteByUserId(user.getId());

        EmailVerificationToken token = new EmailVerificationToken();
        token.setUser(user);
        token.setToken(UUID.randomUUID().toString());
        token.setCreatedAt(Instant.now());
        token.setExpiryAt(Instant.now().plus(24, ChronoUnit.HOURS));
        token.setUsed(false);

        tokenRepository.save(token);

        String verificationLink = baseUrl + "/api/v1/auth/verify-email?token=" + token.getToken();
        emailService.sendVerificationEmail(user.getEmail(), verificationLink);
    }

    public String verifyEmail(String tokenValue) {
        EmailVerificationToken token = tokenRepository.findByToken(tokenValue)
                .orElseThrow(() -> new IllegalArgumentException("Invalid verification token"));

        if (token.isUsed()) {
            throw new IllegalArgumentException("Verification token already used");
        }

        if (token.getExpiryAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Verification token expired");
        }

        User user = token.getUser();
        user.setVerified(true);
        userRepository.save(user);

        token.setUsed(true);
        tokenRepository.save(token);

        return "Email verified successfully";
    }

    public void resendVerification(ResendVerificationRequest request) {
        String email = normalizeEmail(request.getEmail());

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.isVerified()) {
            throw new IllegalArgumentException("Email already verified");
        }

        createAndSendVerificationToken(user);
    }

    private String normalizeEmail(String email) {
        if (email == null || email.trim().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        return email.trim().toLowerCase();
    }
}