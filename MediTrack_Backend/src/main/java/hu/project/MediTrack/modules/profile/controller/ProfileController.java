package hu.project.MediTrack.modules.profile.controller;

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

    // --- Alapműveletek (GET all, POST create) ---

    @GetMapping
    public List<Profile> getAllProfiles(HttpServletRequest request) {
        User user = getCurrentUser(request);

        return profileService.findByUser(user);
    }

    @PostMapping
    public Profile createProfile(@RequestBody Map<String, String> body, HttpServletRequest request) {
        User user = getCurrentUser(request);

        String name = body.get("name");
        String note = body.get("note");

        Profile profile = new Profile();
        profile.setUser(user);
        profile.setName(name);
        profile.setNotes(note);

        return profileService.saveProfile(profile);
    }

    // --- Profilhoz tartozó gyógyszerek listázása ---

    @GetMapping("/{profileId}/medications")
    public List<ProfileMedication> getMedicationsForProfile(@PathVariable Long profileId) {
        return medicationService.getMedicationsForProfile(profileId);
    }

    @PostMapping("/addMedication/{profileId}")
    public ResponseEntity<?> addMedication(@PathVariable Long profileId, @RequestBody Map<String, Long> request) {
        ProfileMedication added = medicationService.addMedication(profileId, request.get("itemId"));
        return ResponseEntity.ok(added);
    }

    @PutMapping("/{profileId}/medications/{itemId}")
    public ProfileMedication updateMedicationForProfile(
            @PathVariable Long profileId,
            @PathVariable Long itemId,
            @RequestBody ProfileMedication data
    ) {
        return medicationService.updateMedication(profileId, itemId, data);
    }

    @DeleteMapping("/{profileId}/medications/{itemId}")
    public void removeMedicationFromProfile(
            @PathVariable Long profileId,
            @PathVariable Long itemId
    ) {
        medicationService.removeMedication(profileId, itemId);
    }

    // --- Egyedi profilműveletek (ID alapján) ---



    @GetMapping("/{id}")
    public Profile getProfileById(@PathVariable Long id) {
        return profileService.findById(id).orElse(null);
    }

    @PutMapping("/{id}")
    public Profile updateProfile(@PathVariable Long id, @RequestBody Profile updatedProfile) {
        return profileService.updateProfile(id, updatedProfile);
    }

    @DeleteMapping("/{id}")
    public void deleteProfile(@PathVariable Long id) {
        System.out.println("Meghívta!!!");
        profileService.deleteById(id);
    }
}