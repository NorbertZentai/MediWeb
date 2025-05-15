package hu.project.MediTrack.modules.profilemedication.controller;

import hu.project.MediTrack.modules.profilemedication.entity.ProfileMedication;
import hu.project.MediTrack.modules.profilemedication.service.ProfileMedicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * REST végpontok a ProfileMedication entitás kezeléséhez.
 * A React Native vagy bármely más kliens JSON formátumban kommunikálhat.
 */
@RestController
@RequestMapping("/api/profile-medications")
public class ProfileMedicationController {

    @Autowired
    private ProfileMedicationService pmService;

    /**
     * GET /api/profile-medications
     * Az összes profil-medication kapcsolat lekérése.
     */
    @GetMapping
    public List<ProfileMedication> getAllProfileMedications() {
        return pmService.findAll();
    }

    /**
     * GET /api/profile-medications/{id}
     * Egy konkrét bejegyzés lekérése ID alapján.
     */
    @GetMapping("/{id}")
    public ProfileMedication getProfileMedicationById(@PathVariable Integer id) {
        Optional<ProfileMedication> pm = pmService.findById(id);
        return pm.orElse(null);
    }

    /**
     * POST /api/profile-medications
     * Új profil-medication kapcsolat létrehozása.
     */
    @PostMapping
    public ProfileMedication createProfileMedication(@RequestBody ProfileMedication profileMedication) {
        return pmService.save(profileMedication);
    }
}
