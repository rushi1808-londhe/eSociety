package com.esociety.backend.services;

import com.esociety.backend.entities.*;
import com.esociety.backend.enums.BillStatus;
import com.esociety.backend.enums.ComplaintStatus;
import com.esociety.backend.enums.ParkingType;
import com.esociety.backend.enums.Role;
import com.esociety.backend.repositories.*;
import com.esociety.backend.response.UniversalResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final BuildingRepository buildingRepository;
    private final FlatRepository flatRepository;
    private final FlatParkingRepository flatParkingRepository;
    private final ResidentRepository residentRepository;
    private final MaintenanceRateRepository maintenanceRateRepository;
    private final MaintenanceBillRepository maintenanceBillRepository;
    private final ComplaintRepository complaintRepository;
    private final NoticeRepository noticeRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UniversalResponse universalResponse;

    // ===== DASHBOARD =====
    public ResponseEntity<?> getDashboardStats(Long societyId) {
        try {
            long totalBuildings = buildingRepository.findBySocietyId(societyId).size();
            long totalFlats = flatRepository.findBySocietyId(societyId).size();
            long totalResidents = residentRepository.findBySocietyId(societyId).size();
            long totalComplaints = complaintRepository.findBySocietyId(societyId).size();
            long openComplaints = complaintRepository.findBySocietyId(societyId)
                    .stream().filter(c -> c.getStatus() == ComplaintStatus.OPEN).count();
            long unpaidBills = maintenanceBillRepository.findBySocietyId(societyId)
                    .stream().filter(b -> b.getStatus() == BillStatus.UNPAID).count();

            Map<String, Long> stats = new HashMap<>();
            stats.put("totalBuildings", totalBuildings);
            stats.put("totalFlats", totalFlats);
            stats.put("totalResidents", totalResidents);
            stats.put("totalComplaints", totalComplaints);
            stats.put("openComplaints", openComplaints);
            stats.put("unpaidBills", unpaidBills);

            return universalResponse.send("Stats fetched successfully", stats, HttpStatus.OK);
        } catch (Exception e) {
            return universalResponse.send("Something went wrong: " + e.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ===== BUILDINGS =====
    public ResponseEntity<?> addBuilding(Building building) {
        try {
            if (buildingRepository.existsByNameAndSocietyId(building.getName(), building.getSocietyId())) {
                return universalResponse.send("Building with this name already exists", null, HttpStatus.CONFLICT);
            }
            buildingRepository.save(building);
            return universalResponse.send("Building added successfully", null, HttpStatus.CREATED);
        } catch (Exception e) {
            return universalResponse.send("Something went wrong: " + e.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<?> getAllBuildings(Long societyId) {
        try {
            List<Building> buildings = buildingRepository.findBySocietyId(societyId);
            return universalResponse.send("Buildings fetched successfully", buildings, HttpStatus.OK);
        } catch (Exception e) {
            return universalResponse.send("Something went wrong: " + e.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<?> updateBuilding(Long buildingId, Building updatedBuilding) {
        try {
            Building building = buildingRepository.findById(buildingId)
                    .orElseThrow(() -> new RuntimeException("Building not found"));
            building.setName(updatedBuilding.getName());
            building.setTotalFloors(updatedBuilding.getTotalFloors());
            buildingRepository.save(building);
            return universalResponse.send("Building updated successfully", null, HttpStatus.OK);
        } catch (Exception e) {
            return universalResponse.send("Something went wrong: " + e.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<?> deleteBuilding(Long buildingId) {
        try {
            if (!buildingRepository.existsById(buildingId)) {
                return universalResponse.send("Building not found", null, HttpStatus.NOT_FOUND);
            }
            buildingRepository.deleteById(buildingId);
            return universalResponse.send("Building deleted successfully", true, HttpStatus.OK);
        } catch (Exception e) {
            return universalResponse.send("Something went wrong: " + e.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ===== FLATS =====
    public ResponseEntity<?> addFlat(Flat flat, List<Map<String, Object>> parkingList) {
        try {
            if (flatRepository.existsByFlatNumberAndBuildingId(flat.getFlatNumber(), flat.getBuildingId())) {
                return universalResponse.send("Flat number already exists in this building", null, HttpStatus.CONFLICT);
            }
            Flat savedFlat = flatRepository.save(flat);

            // Save parking if provided
            if (parkingList != null) {
                for (Map<String, Object> p : parkingList) {
                    FlatParking parking = new FlatParking();
                    parking.setFlatId(savedFlat.getFlatId());
                    parking.setSocietyId(flat.getSocietyId());
                    parking.setParkingType(ParkingType.valueOf((String) p.get("parkingType")));
                    parking.setSlotsCount((Integer) p.get("slotsCount"));
                    flatParkingRepository.save(parking);
                }
            }
            return universalResponse.send("Flat added successfully", null, HttpStatus.CREATED);
        } catch (Exception e) {
            return universalResponse.send("Something went wrong: " + e.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<?> getAllFlats(Long societyId) {
        try {
            List<Flat> flats = flatRepository.findBySocietyId(societyId);
            List<Map<String, Object>> result = flats.stream().map(flat -> {
                Map<String, Object> flatMap = new HashMap<>();
                flatMap.put("flatId", flat.getFlatId());
                flatMap.put("flatNumber", flat.getFlatNumber());
                flatMap.put("floor", flat.getFloor());
                flatMap.put("flatType", flat.getFlatType());
                flatMap.put("isVacant", flat.getIsVacant());
                flatMap.put("buildingId", flat.getBuildingId());
                flatMap.put("societyId", flat.getSocietyId());
                List<FlatParking> parking = flatParkingRepository.findByFlatId(flat.getFlatId());
                flatMap.put("parking", parking);
                return flatMap;
            }).toList();
            return universalResponse.send("Flats fetched successfully", result, HttpStatus.OK);
        } catch (Exception e) {
            return universalResponse.send("Something went wrong: " + e.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<?> updateFlat(Long flatId, Flat updatedFlat, List<Map<String, Object>> parkingList) {
        try {
            Flat flat = flatRepository.findById(flatId)
                    .orElseThrow(() -> new RuntimeException("Flat not found"));
            flat.setFlatNumber(updatedFlat.getFlatNumber());
            flat.setFloor(updatedFlat.getFloor());
            flat.setFlatType(updatedFlat.getFlatType());
            flatRepository.save(flat);

            // Update parking — delete old and save new
            flatParkingRepository.deleteByFlatId(flatId);
            if (parkingList != null) {
                for (Map<String, Object> p : parkingList) {
                    FlatParking parking = new FlatParking();
                    parking.setFlatId(flatId);
                    parking.setSocietyId(flat.getSocietyId());
                    parking.setParkingType(ParkingType.valueOf((String) p.get("parkingType")));
                    parking.setSlotsCount((Integer) p.get("slotsCount"));
                    flatParkingRepository.save(parking);
                }
            }
            return universalResponse.send("Flat updated successfully", null, HttpStatus.OK);
        } catch (Exception e) {
            return universalResponse.send("Something went wrong: " + e.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<?> deleteFlat(Long flatId) {
        try {
            if (!flatRepository.existsById(flatId)) {
                return universalResponse.send("Flat not found", null, HttpStatus.NOT_FOUND);
            }
            flatParkingRepository.deleteByFlatId(flatId);
            flatRepository.deleteById(flatId);
            return universalResponse.send("Flat deleted successfully", true, HttpStatus.OK);
        } catch (Exception e) {
            return universalResponse.send("Something went wrong: " + e.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ===== RESIDENTS =====
    public ResponseEntity<?> addResident(String name, String email, String password,
                                          String phone, String moveInDate, Long flatId, Long societyId) {
        try {
            // Check flat exists and not vacant
            Flat flat = flatRepository.findById(flatId)
                    .orElseThrow(() -> new RuntimeException("Flat not found"));
            if (!flat.getIsVacant()) {
                return universalResponse.send("Flat is already occupied", null, HttpStatus.CONFLICT);
            }
            // Check email
            if (userRepository.findByEmail(email).isPresent()) {
                return universalResponse.send("Email already registered", null, HttpStatus.CONFLICT);
            }
            // Create user
            User user = new User();
            user.setName(name);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            user.setRole(Role.RESIDENT);
            user.setSocietyId(societyId);
            user.setIsActive(true);
            User savedUser = userRepository.save(user);

            // Create resident
            Resident resident = new Resident();
            resident.setSocietyId(societyId);
            resident.setFlatId(flatId);
            resident.setUserId(savedUser.getUserId());
            resident.setPhone(phone);
            resident.setMoveInDate(moveInDate);
            residentRepository.save(resident);

            // Mark flat as occupied
            flat.setIsVacant(false);
            flatRepository.save(flat);

            return universalResponse.send("Resident added successfully", null, HttpStatus.CREATED);
        } catch (Exception e) {
            return universalResponse.send("Something went wrong: " + e.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<?> getAllResidents(Long societyId) {
        try {
            List<Resident> residents = residentRepository.findBySocietyId(societyId);
            List<Map<String, Object>> result = residents.stream().map(resident -> {
                Map<String, Object> map = new HashMap<>();
                map.put("residentId", resident.getResidentId());
                map.put("flatId", resident.getFlatId());
                map.put("phone", resident.getPhone());
                map.put("moveInDate", resident.getMoveInDate());
                Optional<User> user = userRepository.findById(resident.getUserId());
                user.ifPresent(u -> {
                    map.put("name", u.getName());
                    map.put("email", u.getEmail());
                    map.put("isActive", u.getIsActive());
                    map.put("userId", u.getUserId());
                });
                Optional<Flat> flat = flatRepository.findById(resident.getFlatId());
                flat.ifPresent(f -> {
                    map.put("flatNumber", f.getFlatNumber());
                    map.put("flatType", f.getFlatType());
                });
                return map;
            }).toList();
            return universalResponse.send("Residents fetched successfully", result, HttpStatus.OK);
        } catch (Exception e) {
            return universalResponse.send("Something went wrong: " + e.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<?> updateResident(Long residentId, String name, String email,
                                             String phone, String moveInDate) {
        try {
            Resident resident = residentRepository.findById(residentId)
                    .orElseThrow(() -> new RuntimeException("Resident not found"));
            resident.setPhone(phone);
            resident.setMoveInDate(moveInDate);
            residentRepository.save(resident);

            User user = userRepository.findById(resident.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            user.setName(name);
            user.setEmail(email);
            userRepository.save(user);

            return universalResponse.send("Resident updated successfully", null, HttpStatus.OK);
        } catch (Exception e) {
            return universalResponse.send("Something went wrong: " + e.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<?> deleteResident(Long residentId) {
        try {
            Resident resident = residentRepository.findById(residentId)
                    .orElseThrow(() -> new RuntimeException("Resident not found"));

            // Mark flat as vacant
            Flat flat = flatRepository.findById(resident.getFlatId())
                    .orElseThrow(() -> new RuntimeException("Flat not found"));
            flat.setIsVacant(true);
            flatRepository.save(flat);

            // Delete user
            userRepository.deleteById(resident.getUserId());
            residentRepository.deleteById(residentId);

            return universalResponse.send("Resident deleted successfully", true, HttpStatus.OK);
        } catch (Exception e) {
            return universalResponse.send("Something went wrong: " + e.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ===== MAINTENANCE RATES =====
    public ResponseEntity<?> saveRate(MaintenanceRate rate) {
        try {
            Optional<MaintenanceRate> existing = maintenanceRateRepository
                    .findBySocietyIdAndFlatType(rate.getSocietyId(), rate.getFlatType());
            if (existing.isPresent()) {
                MaintenanceRate existingRate = existing.get();
                existingRate.setFlatCharge(rate.getFlatCharge());
                existingRate.setTwoWheelerCharge(rate.getTwoWheelerCharge());
                existingRate.setFourWheelerCharge(rate.getFourWheelerCharge());
                maintenanceRateRepository.save(existingRate);
            } else {
                maintenanceRateRepository.save(rate);
            }
            return universalResponse.send("Rate saved successfully", null, HttpStatus.OK);
        } catch (Exception e) {
            return universalResponse.send("Something went wrong: " + e.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<?> getAllRates(Long societyId) {
        try {
            List<MaintenanceRate> rates = maintenanceRateRepository.findBySocietyId(societyId);
            return universalResponse.send("Rates fetched successfully", rates, HttpStatus.OK);
        } catch (Exception e) {
            return universalResponse.send("Something went wrong: " + e.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ===== MAINTENANCE BILLS =====
    public ResponseEntity<?> generateBills(Long societyId, Integer month, Integer year) {
        try {
            List<Flat> flats = flatRepository.findBySocietyId(societyId);
            int generated = 0;
            for (Flat flat : flats) {
                if (flat.getIsVacant()) continue;

                // Check bill already exists
                Optional<MaintenanceBill> existing = maintenanceBillRepository
                        .findByFlatIdAndBillMonthAndBillYear(flat.getFlatId(), month, year);
                if (existing.isPresent()) continue;

                // Get rate for flat type
                Optional<MaintenanceRate> rate = maintenanceRateRepository
                        .findBySocietyIdAndFlatType(societyId, flat.getFlatType());
                if (rate.isEmpty()) continue;

                // Calculate parking charges
                List<FlatParking> parkingList = flatParkingRepository.findByFlatId(flat.getFlatId());
                double parkingCharge = 0.0;
                for (FlatParking p : parkingList) {
                    if (p.getParkingType() == ParkingType.TWO_WHEELER) {
                        parkingCharge += rate.get().getTwoWheelerCharge() * p.getSlotsCount();
                    } else if (p.getParkingType() == ParkingType.FOUR_WHEELER) {
                        parkingCharge += rate.get().getFourWheelerCharge() * p.getSlotsCount();
                    }
                }

                MaintenanceBill bill = new MaintenanceBill();
                bill.setSocietyId(societyId);
                bill.setFlatId(flat.getFlatId());
                bill.setBillMonth(month);
                bill.setBillYear(year);
                bill.setFlatCharge(rate.get().getFlatCharge());
                bill.setParkingCharge(parkingCharge);
                bill.setTotalAmount(rate.get().getFlatCharge() + parkingCharge);
                bill.setStatus(BillStatus.UNPAID);
                maintenanceBillRepository.save(bill);
                generated++;
            }
            return universalResponse.send("Bills generated successfully for " + generated + " flats", generated, HttpStatus.OK);
        } catch (Exception e) {
            return universalResponse.send("Something went wrong: " + e.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<?> getAllBills(Long societyId) {
        try {
            List<MaintenanceBill> bills = maintenanceBillRepository.findBySocietyId(societyId);
            List<Map<String, Object>> result = bills.stream().map(bill -> {
                Map<String, Object> map = new HashMap<>();
                map.put("billId", bill.getBillId());
                map.put("flatId", bill.getFlatId());
                map.put("billMonth", bill.getBillMonth());
                map.put("billYear", bill.getBillYear());
                map.put("flatCharge", bill.getFlatCharge());
                map.put("parkingCharge", bill.getParkingCharge());
                map.put("totalAmount", bill.getTotalAmount());
                map.put("status", bill.getStatus());
                Optional<Flat> flat = flatRepository.findById(bill.getFlatId());
                flat.ifPresent(f -> map.put("flatNumber", f.getFlatNumber()));
                return map;
            }).toList();
            return universalResponse.send("Bills fetched successfully", result, HttpStatus.OK);
        } catch (Exception e) {
            return universalResponse.send("Something went wrong: " + e.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ===== COMPLAINTS =====
    public ResponseEntity<?> getAllComplaints(Long societyId) {
        try {
            List<Complaint> complaints = complaintRepository.findBySocietyId(societyId);
            return universalResponse.send("Complaints fetched successfully", complaints, HttpStatus.OK);
        } catch (Exception e) {
            return universalResponse.send("Something went wrong: " + e.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<?> updateComplaintStatus(Long complaintId, String status) {
        try {
            Complaint complaint = complaintRepository.findById(complaintId)
                    .orElseThrow(() -> new RuntimeException("Complaint not found"));
            complaint.setStatus(ComplaintStatus.valueOf(status));
            complaintRepository.save(complaint);
            return universalResponse.send("Complaint status updated", null, HttpStatus.OK);
        } catch (Exception e) {
            return universalResponse.send("Something went wrong: " + e.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ===== NOTICES =====
    public ResponseEntity<?> addNotice(Notice notice) {
        try {
            notice.setPostedAt(LocalDate.now().toString());
            noticeRepository.save(notice);
            return universalResponse.send("Notice posted successfully", null, HttpStatus.CREATED);
        } catch (Exception e) {
            return universalResponse.send("Something went wrong: " + e.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<?> getAllNotices(Long societyId) {
        try {
            List<Notice> notices = noticeRepository.findBySocietyId(societyId);
            return universalResponse.send("Notices fetched successfully", notices, HttpStatus.OK);
        } catch (Exception e) {
            return universalResponse.send("Something went wrong: " + e.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<?> deleteNotice(Long noticeId) {
        try {
            if (!noticeRepository.existsById(noticeId)) {
                return universalResponse.send("Notice not found", null, HttpStatus.NOT_FOUND);
            }
            noticeRepository.deleteById(noticeId);
            return universalResponse.send("Notice deleted successfully", true, HttpStatus.OK);
        } catch (Exception e) {
            return universalResponse.send("Something went wrong: " + e.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    public ResponseEntity<?> toggleBuildingStatus(Long buildingId) {
        try {
            Building building = buildingRepository.findById(buildingId)
                    .orElseThrow(() -> new RuntimeException("Building not found"));
            building.setIsActive(!building.getIsActive());
            buildingRepository.save(building);
            String message = building.getIsActive() ? "Building activated" : "Building deactivated";
            return universalResponse.send(message, building.getIsActive(), HttpStatus.OK);
        } catch (Exception e) {
            return universalResponse.send("Something went wrong: " + e.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    public ResponseEntity<?> toggleResidentStatus(Long residentId) {
        try {
            Resident resident = residentRepository.findById(residentId)
                    .orElseThrow(() -> new RuntimeException("Resident not found"));
            User user = userRepository.findById(resident.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            user.setIsActive(!user.getIsActive());
            userRepository.save(user);
            String message = user.getIsActive() ? "Resident activated" : "Resident deactivated";
            return universalResponse.send(message, user.getIsActive(), HttpStatus.OK);
        } catch (Exception e) {
            return universalResponse.send("Something went wrong: " + e.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}