package com.esociety.backend.controllers;

import com.esociety.backend.entities.*;
import com.esociety.backend.services.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // ===== DASHBOARD =====
    @GetMapping("/dashboard/{societyId}")
    public ResponseEntity<?> getDashboardStats(@PathVariable Long societyId) {
        return adminService.getDashboardStats(societyId);
    }

    // ===== BUILDINGS =====
    @PostMapping("/building/add")
    public ResponseEntity<?> addBuilding(@RequestBody Building building) {
        return adminService.addBuilding(building);
    }

    @GetMapping("/building/all/{societyId}")
    public ResponseEntity<?> getAllBuildings(@PathVariable Long societyId) {
        return adminService.getAllBuildings(societyId);
    }

    @PutMapping("/building/update/{id}")
    public ResponseEntity<?> updateBuilding(@PathVariable Long id, @RequestBody Building building) {
        return adminService.updateBuilding(id, building);
    }

    @DeleteMapping("/building/delete/{id}")
    public ResponseEntity<?> deleteBuilding(@PathVariable Long id) {
        return adminService.deleteBuilding(id);
    }

    // ===== FLATS =====
    @SuppressWarnings("unchecked")
    @PostMapping("/flat/add")
    public ResponseEntity<?> addFlat(@RequestBody Map<String, Object> request) {
        Flat flat = new Flat();
        flat.setSocietyId(Long.parseLong(request.get("societyId").toString()));
        flat.setBuildingId(Long.parseLong(request.get("buildingId").toString()));
        flat.setFlatNumber((String) request.get("flatNumber"));
        flat.setFloor(Integer.parseInt(request.get("floor").toString()));
        flat.setFlatType(com.esociety.backend.enums.FlatType.valueOf((String) request.get("flatType")));
        List<Map<String, Object>> parkingList = (List<Map<String, Object>>) request.get("parking");
        return adminService.addFlat(flat, parkingList);
    }

    @GetMapping("/flat/all/{societyId}")
    public ResponseEntity<?> getAllFlats(@PathVariable Long societyId) {
        return adminService.getAllFlats(societyId);
    }

    @SuppressWarnings("unchecked")
    @PutMapping("/flat/update/{id}")
    public ResponseEntity<?> updateFlat(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        Flat flat = new Flat();
        flat.setFlatNumber((String) request.get("flatNumber"));
        flat.setFloor(Integer.parseInt(request.get("floor").toString()));
        flat.setFlatType(com.esociety.backend.enums.FlatType.valueOf((String) request.get("flatType")));
        List<Map<String, Object>> parkingList = (List<Map<String, Object>>) request.get("parking");
        return adminService.updateFlat(id, flat, parkingList);
    }

    @DeleteMapping("/flat/delete/{id}")
    public ResponseEntity<?> deleteFlat(@PathVariable Long id) {
        return adminService.deleteFlat(id);
    }

    // ===== RESIDENTS =====
    @PostMapping("/resident/add")
    public ResponseEntity<?> addResident(@RequestBody Map<String, String> request) {
        return adminService.addResident(
            request.get("name"),
            request.get("email"),
            request.get("password"),
            request.get("phone"),
            request.get("moveInDate"),
            Long.parseLong(request.get("flatId")),
            Long.parseLong(request.get("societyId"))
        );
    }

    @GetMapping("/resident/all/{societyId}")
    public ResponseEntity<?> getAllResidents(@PathVariable Long societyId) {
        return adminService.getAllResidents(societyId);
    }

    @PutMapping("/resident/update/{id}")
    public ResponseEntity<?> updateResident(@PathVariable Long id, @RequestBody Map<String, String> request) {
        return adminService.updateResident(
            id,
            request.get("name"),
            request.get("email"),
            request.get("phone"),
            request.get("moveInDate")
        );
    }

    @DeleteMapping("/resident/delete/{id}")
    public ResponseEntity<?> deleteResident(@PathVariable Long id) {
        return adminService.deleteResident(id);
    }

    // ===== MAINTENANCE RATES =====
    @PostMapping("/rate/save")
    public ResponseEntity<?> saveRate(@RequestBody MaintenanceRate rate) {
        return adminService.saveRate(rate);
    }

    @GetMapping("/rate/all/{societyId}")
    public ResponseEntity<?> getAllRates(@PathVariable Long societyId) {
        return adminService.getAllRates(societyId);
    }

    // ===== MAINTENANCE BILLS =====
    @PostMapping("/bill/generate")
    public ResponseEntity<?> generateBills(@RequestBody Map<String, Object> request) {
        return adminService.generateBills(
            Long.parseLong(request.get("societyId").toString()),
            Integer.parseInt(request.get("month").toString()),
            Integer.parseInt(request.get("year").toString())
        );
    }

    @GetMapping("/bill/all/{societyId}")
    public ResponseEntity<?> getAllBills(@PathVariable Long societyId) {
        return adminService.getAllBills(societyId);
    }

    // ===== COMPLAINTS =====
    @GetMapping("/complaint/all/{societyId}")
    public ResponseEntity<?> getAllComplaints(@PathVariable Long societyId) {
        return adminService.getAllComplaints(societyId);
    }

    @PutMapping("/complaint/update/{id}")
    public ResponseEntity<?> updateComplaintStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        return adminService.updateComplaintStatus(id, request.get("status"));
    }

    // ===== NOTICES =====
    @PostMapping("/notice/add")
    public ResponseEntity<?> addNotice(@RequestBody Notice notice) {
        return adminService.addNotice(notice);
    }

    @GetMapping("/notice/all/{societyId}")
    public ResponseEntity<?> getAllNotices(@PathVariable Long societyId) {
        return adminService.getAllNotices(societyId);
    }

    @DeleteMapping("/notice/delete/{id}")
    public ResponseEntity<?> deleteNotice(@PathVariable Long id) {
        return adminService.deleteNotice(id);
    }
    
    @PutMapping("/building/toggle/{id}")
    public ResponseEntity<?> toggleBuildingStatus(@PathVariable Long id) {
        return adminService.toggleBuildingStatus(id);
    }
    
    @PutMapping("/resident/toggle/{id}")
    public ResponseEntity<?> toggleResidentStatus(@PathVariable Long id) {
        return adminService.toggleResidentStatus(id);
    }
}