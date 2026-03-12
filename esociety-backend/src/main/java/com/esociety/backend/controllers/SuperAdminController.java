package com.esociety.backend.controllers;

import com.esociety.backend.entities.Society;
import com.esociety.backend.services.SuperAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/superadmin")
@RequiredArgsConstructor
public class SuperAdminController {

    private final SuperAdminService superAdminService;

    // Dashboard Stats
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats() {
        return superAdminService.getDashboardStats();
    }

    // Add Society
    @PostMapping("/society/add")
    public ResponseEntity<?> addSociety(@RequestBody Society society) {
        return superAdminService.addSociety(society);
    }

    // Get All Societies
    @GetMapping("/society/all")
    public ResponseEntity<?> getAllSocieties() {
        return superAdminService.getAllSocieties();
    }

    // Add Admin
    @PostMapping("/admin/add")
    public ResponseEntity<?> addAdmin(@RequestBody Map<String, String> request) {
        return superAdminService.addAdmin(
            request.get("name"),
            request.get("email"),
            request.get("password"),
            Long.parseLong(request.get("societyId"))
        );
    }

    // Get All Admins
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllAdmins() {
        return superAdminService.getAllAdmins();
    }
    
 // Update Society
    @PutMapping("/society/update/{id}")
    public ResponseEntity<?> updateSociety(@PathVariable Long id, @RequestBody Society society) {
        return superAdminService.updateSociety(id, society);
    }

    // Delete Society
    @DeleteMapping("/society/delete/{id}")
    public ResponseEntity<?> deleteSociety(@PathVariable Long id) {
        return superAdminService.deleteSociety(id);
    }
    
    @DeleteMapping("/admin/delete/{id}")
    public ResponseEntity<?> deleteAdmin(@PathVariable Long id) {
        return superAdminService.deleteAdmin(id);
    }
    
 // Update Admin
    @PutMapping("/admin/update/{id}")
    public ResponseEntity<?> updateAdmin(@PathVariable Long id, @RequestBody Map<String, String> request) {
        return superAdminService.updateAdmin(
            id,
            request.get("name"),
            request.get("email"),
            Long.parseLong(request.get("societyId"))
        );
    }

    // Toggle Admin Status
    @PutMapping("/admin/toggle/{id}")
    public ResponseEntity<?> toggleAdminStatus(@PathVariable Long id) {
        return superAdminService.toggleAdminStatus(id);
    }
    
    @PutMapping("/society/toggle/{id}")
    public ResponseEntity<?> toggleSocietyStatus(@PathVariable Long id) {
        return superAdminService.toggleSocietyStatus(id);
    }
}