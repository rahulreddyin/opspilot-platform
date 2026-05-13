package com.opspilot.platform.security;

import com.opspilot.platform.service.AuditLogService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimitService rateLimitService;
    private final AuditLogService auditLogService;

    public RateLimitFilter(RateLimitService rateLimitService,
                           AuditLogService auditLogService) {
        this.rateLimitService = rateLimitService;
        this.auditLogService = auditLogService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();
        String ip = getClientIp(request);

        // ==============================
        // 🚀 REGISTER RATE LIMIT
        // ==============================
        if ("POST".equalsIgnoreCase(method) && path.equals("/api/v1/auth/register")) {

            String key = "register:" + ip;

            boolean allowed = rateLimitService.tryConsume(
                    key,
                    5, // max requests
                    Duration.ofMinutes(10)
            );

            if (!allowed) {
                auditLogService.logRateLimitHit(key, path);
                write429(response, "Too many registration attempts. Try again later.");
                return;
            }
        }

        // ==============================
        // 🔐 OTP VERIFY RATE LIMIT
        // ==============================
        if ("POST".equalsIgnoreCase(method)
                && path.equals("/api/v1/auth/register/verify-otp")) {

            String key = "verify-otp:" + ip;

            boolean allowed = rateLimitService.tryConsume(
                    key,
                    10, // max attempts
                    Duration.ofMinutes(10)
            );

            if (!allowed) {
                auditLogService.logRateLimitHit(key, path);
                write429(response, "Too many OTP attempts. Try again later.");
                return;
            }
        }

        // continue request
        filterChain.doFilter(request, response);
    }

    // ==============================
    // 🔍 CLIENT IP HELPER
    // ==============================
    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");

        if (xfHeader == null || xfHeader.isEmpty()) {
            return request.getRemoteAddr();
        }

        return xfHeader.split(",")[0];
    }

    // ==============================
    // 🚫 429 RESPONSE
    // ==============================
    private void write429(HttpServletResponse response, String message)
            throws IOException {

        response.setStatus(429);
        response.setContentType("application/json");

        response.getWriter().write(
                "{\"error\": \"" + message + "\"}"
        );
    }
}