package com.esociety.backend.services;

import com.esociety.backend.entities.Society;
import com.esociety.backend.entities.User;
import com.esociety.backend.enums.Role;
import com.esociety.backend.repositories.SocietyRepository;
import com.esociety.backend.repositories.UserRepository;
import com.esociety.backend.response.UniversalResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SuperAdminService {

    private final SocietyRepository societyRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UniversalResponse universalResponse;

    // ===== SOCIETY =====

    // Add Society
    public ResponseEntity<?> addSociety(Society society) {
        try {
            if (societyRepository.existsByName(society.getName())) {
                return universalResponse.send("Society with this name already exists", null, HttpStatus.CONFLICT);
            }
            societyRepository.save(society);
            return universalResponse.send("Society added successfully", null, HttpStatus.CREATED);
        } catch (Exception e) {
            return universalResponse.send("Something went wrong: " + e.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get All Societies
    public ResponseEntity<?> getAllSocieties() {
        try {
            List<Society> societies = societyRepository.findAll();
            return universalResponse.send("Societies fetched successfully", societies, HttpStatus.OK);
        } catch (Exception e) {
            return universalResponse.send("Something went wrong: " + e.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ===== ADMIN =====

    // Add Admin for a Society
    public ResponseEntity<?> addAdmin(String name, String email, String password, Long societyId) {
        try {
            // Check society exists
            if (!societyRepository.existsById(societyId)) {
                return universalResponse.send("Society not found", null, HttpStatus.NOT_FOUND);
            }
            // Check email already exists
            if (userRepository.findByEmail(email).isPresent()) {
                return universalResponse.send("Email already registered", null, HttpStatus.CONFLICT);
            }
            // Create admin user
            User admin = new User();
            admin.setName(name);
            admin.setEmail(email);
            admin.setPassword(passwordEncoder.encode(password));
            admin.setRole(Role.ADMIN);
            admin.setSocietyId(societyId);
            admin.setIsActive(true);
            userRepository.save(admin);
            return universalResponse.send("Admin added successfully", null, HttpStatus.CREATED);
        } catch (Exception e) {
            return universalResponse.send("Something went wrong: " + e.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get All Admins
    public ResponseEntity<?> getAllAdmins() {
        try {
            List<User> admins = userRepository.findByRole(Role.ADMIN);
            return universalResponse.send("Admins fetched successfully", admins, HttpStatus.OK);
        } catch (Exception e) {
            return universalResponse.send("Something went wrong: " + e.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get Dashboard Stats
    public ResponseEntity<?> getDashboardStats() {
        try {
            long totalSocieties = societyRepository.count();
            long totalAdmins = userRepository.countByRole(Role.ADMIN);
            java.util.Map<String, Long> stats = new java.util.HashMap<>();
            stats.put("totalSocieties", totalSocieties);
            stats.put("totalAdmins", totalAdmins);
            return universalResponse.send("Stats fetched successfully", stats, HttpStatus.OK);
        } catch (Exception e) {
            return universalResponse.send("Something went wrong: " + e.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
 // Update Society
    public ResponseEntity<?> updateSociety(Long societyId, Society updatedSociety) {
        try {
            Society society = societyRepository.findById(societyId)
                    .orElseThrow(() -> new RuntimeException("Society not found"));
            society.setName(updatedSociety.getName());
            society.setAddress(updatedSociety.getAddress());
            society.setCity(updatedSociety.getCity());
            society.setState(updatedSociety.getState());
            societyRepository.save(society);
            return universalResponse.send("Society updated successfully", null, HttpStatus.OK);
        } catch (Exception e) {
            return universalResponse.send("Something went wrong: " + e.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Delete Society
    public ResponseEntity<?> deleteSociety(Long societyId) {
        try {
            if (!societyRepository.existsById(societyId)) {
                return universalResponse.send("Society not found", null, HttpStatus.NOT_FOUND);
            }
            societyRepository.deleteById(societyId);
            return universalResponse.send("Society deleted successfully", true, HttpStatus.OK);
        } catch (Exception e) {
            return universalResponse.send("Something went wrong: " + e.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    public ResponseEntity<?> deleteAdmin(Long userId) {
        try {
            if (!userRepository.existsById(userId)) {
                return universalResponse.send("Admin not found", null, HttpStatus.NOT_FOUND);
            }
            userRepository.deleteById(userId);
            return universalResponse.send("Admin deleted successfully", true, HttpStatus.OK);
        } catch (Exception e) {
            return universalResponse.send("Something went wrong: " + e.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
 // Update Admin
    public ResponseEntity<?> updateAdmin(Long userId, String name, String email, Long societyId) {
        try {
            User admin = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Admin not found"));
            admin.setName(name);
            admin.setEmail(email);
            admin.setSocietyId(societyId);
            userRepository.save(admin);
            return universalResponse.send("Admin updated successfully", null, HttpStatus.OK);
        } catch (Exception e) {
            return universalResponse.send("Something went wrong: " + e.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Toggle Admin Status
    public ResponseEntity<?> toggleAdminStatus(Long userId) {
        try {
            User admin = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Admin not found"));
            admin.setIsActive(!admin.getIsActive());
            userRepository.save(admin);
            String message = admin.getIsActive() ? "Admin activated successfully" : "Admin deactivated successfully";
            return universalResponse.send(message, admin.getIsActive(), HttpStatus.OK);
        } catch (Exception e) {
            return universalResponse.send("Something went wrong: " + e.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    public ResponseEntity<?> toggleSocietyStatus(Long societyId) {
        try {
            Society society = societyRepository.findById(societyId)
                    .orElseThrow(() -> new RuntimeException("Society not found"));
            society.setIsActive(!society.getIsActive());
            societyRepository.save(society);

            // Update all admins of this society to same status
            List<User> admins = userRepository.findByRoleAndSocietyId(Role.ADMIN, societyId);
            for (User admin : admins) {
                admin.setIsActive(society.getIsActive());
            }
            userRepository.saveAll(admins);

            String message = society.getIsActive() ? "Society activated successfully" : "Society deactivated successfully";
            return universalResponse.send(message, society.getIsActive(), HttpStatus.OK);
        } catch (Exception e) {
            return universalResponse.send("Something went wrong: " + e.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}