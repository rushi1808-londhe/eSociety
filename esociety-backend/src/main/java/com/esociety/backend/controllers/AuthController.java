package com.esociety.backend.controllers;

import com.esociety.backend.enums.Role;
import com.esociety.backend.services.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");
        return authService.login(email, password);
    }

    // REGISTER
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        String name = request.get("name");
        String email = request.get("email");
        String password = request.get("password");
        String role = request.get("role");
        Long societyId = Long.parseLong(request.get("societyId"));
        return authService.register(name, email, password, Role.valueOf(role), societyId);
    }
}