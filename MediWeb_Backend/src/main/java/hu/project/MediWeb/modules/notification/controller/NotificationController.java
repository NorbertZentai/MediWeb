package hu.project.MediWeb.modules.notification.controller;

import hu.project.MediWeb.modules.notification.dto.IntakeSubmissionRequest;
import hu.project.MediWeb.modules.notification.dto.TodaysMedicationDTO;
import hu.project.MediWeb.modules.notification.service.MedicationIntakeService;
import hu.project.MediWeb.modules.profile.service.ProfileMedicationService;
import hu.project.MediWeb.modules.profile.service.ProfileService;
import hu.project.MediWeb.modules.user.entity.User;
import hu.project.MediWeb.modules.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/intake")
@RequiredArgsConstructor
public class NotificationController {

    private final MedicationIntakeService medicationIntakeService;
    private final ProfileService profileService;
    private final ProfileMedicationService profileMedicationService;
    private final UserService userService;

    private User requireCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() ||
                "anonymousUser".equals(authentication.getPrincipal())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return userService.findUserByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    @GetMapping("/today/{profileId}")
    public ResponseEntity<List<TodaysMedicationDTO>> getTodayMedications(@PathVariable Long profileId) {
        profileService.requireOwnedProfile(profileId, requireCurrentUser());
        return ResponseEntity.ok(medicationIntakeService.getMedicationsForToday(profileId));
    }

    @PostMapping
    public ResponseEntity<Void> submitIntake(@RequestBody IntakeSubmissionRequest request) {
        profileMedicationService.requireOwnedProfileMedication(request.getProfileMedicationId(), requireCurrentUser());
        medicationIntakeService.recordIntake(request);
        return ResponseEntity.ok().build();
    }
}
