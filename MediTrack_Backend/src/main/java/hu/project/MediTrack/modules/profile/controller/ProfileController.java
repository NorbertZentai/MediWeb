package hu.project.MediTrack.modules.profile.controller;

import hu.project.MediTrack.modules.profile.dto.ProfileDTO;
import hu.project.MediTrack.modules.profile.dto.ProfileMedicationDTO;
import hu.project.MediTrack.modules.profile.entity.Profile;
import hu.project.MediTrack.modules.profile.entity.ProfileMedication;
import hu.project.MediTrack.modules.profile.service.ProfileService;
import hu.project.MediTrack.modules.profile.service.ProfileMedicationService;
import hu.project.MediTrack.modules.user.entity.User;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/profiles")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @Autowired
    private ProfileMedicationService medicationService;

    private User getCurrentUser(HttpServletRequest request) {
        return (User) request.getSession().getAttribute("user");
    }

    @GetMapping
    public List<ProfileDTO> getAllProfiles(HttpServletRequest request) {
        User user = getCurrentUser(request);
        return profileService.findByUser(user);
    }

    @PostMapping
    public ProfileDTO createProfile(@RequestBody Map<String, String> body, HttpServletRequest request) {
        User user = getCurrentUser(request);

        Profile profile = Profile.builder()
                .user(user)
                .name(body.get("name"))
                .notes(body.get("note"))
                .build();

        return profileService.saveProfile(profile);
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

    @PutMapping("/{profileId}/medications/{itemId}")
    public ProfileMedicationDTO updateMedicationForProfile(@PathVariable Long profileId, @PathVariable Long itemId, @RequestBody ProfileMedicationDTO data ) {
        return medicationService.updateMedication(profileId, itemId, data);
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