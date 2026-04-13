package com.opspilot.platform.auth.service;

import com.opspilot.platform.auth.dto.AuthResponse;
import com.opspilot.platform.auth.dto.LoginRequest;
import com.opspilot.platform.auth.dto.RegisterRequest;
import com.opspilot.platform.domain.Role;
import com.opspilot.platform.domain.User;
import com.opspilot.platform.repository.UserRepository;
import com.opspilot.platform.security.CustomUserDetailsService;
import com.opspilot.platform.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Set;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService customUserDetailsService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthenticationManager authenticationManager,
                       CustomUserDetailsService customUserDetailsService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.customUserDetailsService = customUserDetailsService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("User already exists with this email");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setCreatedAt(Instant.now());
        user.setRoles(Set.of(Role.USER));

        User savedUser = userRepository.save(user);

        UserDetails userDetails = customUserDetailsService.loadUserByUsername(savedUser.getEmail());
        String token = jwtService.generateToken(userDetails);

        String primaryRole = savedUser.getRoles()
                .stream()
                .findFirst()
                .map(Enum::name)
                .orElse("USER");

        return new AuthResponse(
                token,
                savedUser.getEmail(),
                primaryRole
        );
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserDetails userDetails = customUserDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);

        String primaryRole = user.getRoles()
                .stream()
                .findFirst()
                .map(Enum::name)
                .orElse("USER");

        return new AuthResponse(
                token,
                user.getEmail(),
                primaryRole
        );
    }
}