package com.opspilot.platform.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.email-verification.from-email}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtpEmail(String email, String otp) {
    System.out.println("OTP for " + email + " = " + otp);
}



    public void sendSimpleEmail(String toEmail, String subject, String body) {
    try {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    } catch (Exception ex) {
        ex.printStackTrace();
        throw new RuntimeException("Failed to send email", ex);
    }
}


    public void sendVerificationEmail(String toEmail, String verificationLink) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Verify your OpsPilot account");
            message.setText(
                    "Welcome to OpsPilot.\n\n"
                            + "Please verify your email by clicking the link below:\n"
                            + verificationLink
                            + "\n\nIf you did not create this account, you can ignore this email."
            );

            System.out.println("MAIL DEBUG: Attempting to send verification email to " + toEmail);
            System.out.println("MAIL DEBUG: From = " + fromEmail);

            mailSender.send(message);

            System.out.println("MAIL DEBUG: Verification email sent successfully to " + toEmail);
        } catch (Exception ex) {
            System.out.println("MAIL DEBUG: Email sending failed");
            ex.printStackTrace();
            throw new RuntimeException("Failed to send verification email", ex);
        }
    }
}