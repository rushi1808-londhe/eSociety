package com.esociety.backend.services;

import com.esociety.backend.entities.User;
import com.esociety.backend.enums.Role;
import com.esociety.backend.jwt.JWTTokenGenerator;
import com.esociety.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.esociety.backend.response.UniversalResponse;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JWTTokenGenerator jwtTokenGenerator;
    private final AuthenticationManager authenticationManager;
    private final MyUserDetailsService myUserDetailsService;
    private final PasswordEncoder passwordEncoder;
    private final UniversalResponse universalResponse;

    // LOGIN
    public ResponseEntity<?> login(String email, String password) {
        try {
            // Step 1 - Authenticate email and password
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
            );

            // Step 2 - Load user details
            UserDetails userDetails = myUserDetailsService.loadUserByUsername(email);

            // Step 3 - Get user from DB for extra info
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Step 4 - Generate JWT token
            String token = jwtTokenGenerator.generateToken(userDetails, user.getRole().name());

            // Step 5 - Build response data
            Map<String, Object> data = new HashMap<>();
            data.put("token", token);
            data.put("userId", user.getUserId());
            data.put("email", user.getEmail());
            data.put("name", user.getName());
            data.put("role", user.getRole());
            data.put("societyId", user.getSocietyId());

            return universalResponse.send("Login successful", data, HttpStatus.OK);

        } catch (BadCredentialsException e) {
            return universalResponse.send("Invalid email or password", null, HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            return universalResponse.send("Something went wrong: " + e.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // REGISTER (used by super admin to create admins and residents)
    public ResponseEntity<?> register(String name, String email, String password, Role role, Long societyId) {
        try {
            // Step 1 - Check if email already exists
            if (userRepository.findByEmail(email).isPresent()) {
                return universalResponse.send("Email already registered", null, HttpStatus.CONFLICT);
            }

            // Step 2 - Create new user
            User user = new User();
            user.setName(name);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            user.setRole(role);
            user.setSocietyId(societyId);
            user.setIsActive(true);

            // Step 3 - Save to DB
            userRepository.save(user);

            return universalResponse.send("User registered successfully", null, HttpStatus.CREATED);

        } catch (Exception e) {
            return universalResponse.send("Something went wrong: " + e.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}