package hu.project.MediTrack.modules.profile.controller;

import hu.project.MediTrack.modules.profile.entity.Profile;
import hu.project.MediTrack.modules.profile.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * REST controller a Profile entitáshoz.
 * A React Native kliens ezen a végponton keresztül érheti el a profil-adatokat.
 */
@RestController
@RequestMapping("/api/profiles")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    /**
     * GET /api/profiles
     * Az összes profil lekérése.
     */
    @GetMapping
    public List<Profile> getAllProfiles() {
        return profileService.findAll();
    }

    /**
     * GET /api/profiles/{id}
     * Egy profil lekérése ID alapján.
     */
    @GetMapping("/{id}")
    public Profile getProfileById(@PathVariable Integer id) {
        Optional<Profile> profile = profileService.findById(id);
        return profile.orElse(null);
    }

    /**
     * POST /api/profiles
     * Új profil létrehozása.
     */
    @PostMapping
    public Profile createProfile(@RequestBody Profile profile) {
        return profileService.saveProfile(profile);
    }

    /**
     * PUT /api/profiles/{id}
     * Létező profil frissítése.
     */
    @PutMapping("/{id}")
    public Profile updateProfile(@PathVariable Integer id, @RequestBody Profile updatedProfile) {
        Optional<Profile> existing = profileService.findById(id);
        if (existing.isPresent()) {
            Profile p = existing.get();
            p.setName(updatedProfile.getName());
            p.setDateOfBirth(updatedProfile.getDateOfBirth());
            p.setGender(updatedProfile.getGender());
            p.setNotes(updatedProfile.getNotes());
            p.setRelationship(updatedProfile.getRelationship());
            p.setHealthCondition(updatedProfile.getHealthCondition());
            p.setEmergencyContact(updatedProfile.getEmergencyContact());
            p.setAddress(updatedProfile.getAddress());
            p.setUser(updatedProfile.getUser());
            return profileService.saveProfile(p);
        }
        return null; // v. dobj exception-t
    }

    /**
     * DELETE /api/profiles/{id}
     * Profil törlése ID alapján.
     */
    @DeleteMapping("/{id}")
    public void deleteProfile(@PathVariable Integer id) {
        profileService.deleteById(id);
    }
}
