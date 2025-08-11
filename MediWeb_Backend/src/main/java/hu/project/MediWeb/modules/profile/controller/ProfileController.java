package hu.project.MediWeb.modules.profile.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import hu.project.MediWeb.modules.profile.dto.ProfileDTO;
import hu.project.MediWeb.modules.profile.dto.ProfileMedicationDTO;
import hu.project.MediWeb.modules.profile.entity.Profile;
import hu.project.MediWeb.modules.profile.service.ProfileService;
import hu.project.MediWeb.modules.profile.service.ProfileMedicationService;
import hu.project.MediWeb.modules.user.entity.User;
import hu.project.MediWeb.modules.user.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/profiles")
public class ProfileController {

    @Autowired
    private ProfileService profileService;
    @Autowired
    private ProfileMedicationService medicationService;
    @Autowired
    private UserService userService;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated() || 
            "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }

        String email = authentication.getName();
        Optional<User> userOptional = userService.findUserByEmail(email);
        return userOptional.orElse(null);
    }

    @GetMapping
    public ResponseEntity<List<ProfileDTO>> getAllProfiles() {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<ProfileDTO> profiles = profileService.findByUser(user);
        return ResponseEntity.ok(profiles);
    }

    @PostMapping
    public ResponseEntity<ProfileDTO> createProfile(@RequestBody Map<String, String> body) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Profile profile = Profile.builder()
                .user(user)
                .name(body.get("name"))
                .notes(body.get("notes"))
                .build();

        ProfileDTO created = profileService.saveProfile(profile);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/{profileId}/medications")
    public List<ProfileMedicationDTO> getMedicationsForProfile(@PathVariable Long profileId) {
        return medicationService.getMedicationsForProfile(profileId);
    }

    @PostMapping("/addMedication/{profileId}")
    public ResponseEntity<ProfileMedicationDTO> addMedication( @PathVariable Long profileId, @RequestBody Map<String, Long> request) {
        Long itemId = request.get("itemId");
        ProfileMedicationDTO added = medicationService.addMedication(profileId, itemId);
        return ResponseEntity.ok(added);
    }

    @PutMapping("/{profileId}/medications/{medicationId}")
    public ProfileMedicationDTO updateMedicationForProfile( @PathVariable Long profileId, @PathVariable Long medicationId, @RequestBody Map<String, Object> data ) {
        try {
            String note = (String) data.get("note");
            ObjectMapper objectMapper = new ObjectMapper();

            String remindersJson = objectMapper.writeValueAsString(data.get("reminders"));
            return medicationService.updateMedication(profileId, medicationId, note, remindersJson);
        } catch (Exception e) {
            throw new RuntimeException("Reminders feldolgozási hiba", e);
        }
    }

    @DeleteMapping("/{profileId}/medications/{itemId}")
    public void removeMedicationFromProfile(
            @PathVariable Long profileId,
            @PathVariable Long itemId) {
        medicationService.removeMedication(profileId, itemId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProfileDTO> getProfileById(@PathVariable Long id) {
        ProfileDTO dto = profileService.findById(id);
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ProfileDTO updateProfile(@PathVariable Long id, @RequestBody Profile updatedProfile) {
        return profileService.updateProfile(id, updatedProfile);
    }

    @DeleteMapping("/{id}")
    public void deleteProfile(@PathVariable Long id) {
        profileService.deleteById(id);
    }
}