package hu.project.MediWeb.modules.dashboard.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import hu.project.MediWeb.modules.dashboard.dto.DashboardResponse;
import hu.project.MediWeb.modules.dashboard.dto.PopularMedicationDTO;
import hu.project.MediWeb.modules.dashboard.service.DashboardService;
import hu.project.MediWeb.modules.user.entity.User;
import hu.project.MediWeb.modules.user.service.UserService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<DashboardResponse> getDashboard() {
        User currentUser = getCurrentUser();
        DashboardResponse response = dashboardService.buildDashboardForUser(currentUser);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/popular-medications")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<List<PopularMedicationDTO>> getPopularMedications(
            @RequestParam(name = "limit", required = false) Optional<Integer> limitParam) {
        int limit = limitParam.filter(value -> value > 0 && value <= 20).orElse(6);
        List<PopularMedicationDTO> payload = dashboardService.getPopularMedications(limit);
        return ResponseEntity.ok(payload);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "A dashboard megtekintéséhez be kell jelentkezni.");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof org.springframework.security.core.userdetails.User userDetails) {
            return userService.findUserByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Felhasználó nem található."));
        }

        if (principal instanceof String principalName && !"anonymousUser".equals(principalName)) {
            return userService.findUserByEmail(principalName)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Felhasználó nem található."));
        }

        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Érvénytelen autentikációs állapot.");
    }
}
