package hu.project.MediWeb.modules.user.controller;

import hu.project.MediWeb.modules.user.dto.PasswordChangeRequest;
import hu.project.MediWeb.modules.user.dto.PasswordConfirmationRequest;
import hu.project.MediWeb.modules.user.dto.UserDTO;
import hu.project.MediWeb.modules.user.dto.UserPreferencesDto;
import hu.project.MediWeb.modules.user.entity.User;
import hu.project.MediWeb.modules.user.enums.UserDataRequestType;
import hu.project.MediWeb.modules.user.enums.UserRole;
import hu.project.MediWeb.modules.user.service.UserDataRequestService;
import hu.project.MediWeb.modules.user.service.UserPreferencesService;
import hu.project.MediWeb.modules.user.service.UserService;
import hu.project.MediWeb.modules.user.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserPreferencesService userPreferencesService;

    @Autowired
    private UserDataRequestService userDataRequestService;

    @Autowired
    private AuthService authService;

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

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public List<UserDTO> getAllUsers() {
        return userService.findAllUsers().stream().map(UserDTO::from).toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public UserDTO createUser(@RequestBody User user) {
        return UserDTO.from(userService.saveUser(user));
    }

    @PutMapping("/username")
    public ResponseEntity<String> updateUsername(@RequestBody String username) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Nem vagy bejelentkezve.");
        }
        user.setName(username);
        userService.saveUser(user);
        return ResponseEntity.ok(username);
    }

    @PutMapping("/email")
    public ResponseEntity<String> updateEmail(@RequestBody String email) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Nem vagy bejelentkezve.");
        }
        user.setEmail(email);
        userService.saveUser(user);
        return ResponseEntity.ok(email);
    }

    @PutMapping("/password")
    public ResponseEntity<?> updatePassword(@RequestBody PasswordChangeRequest requestBody) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Nem vagy bejelentkezve.");
        }
        boolean success = userService.changePassword(user, requestBody);

        if (success) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.badRequest().body("Hibás jelenlegi jelszó vagy nem egyező új jelszavak.");
        }
    }

    @PutMapping("/phone")
    public ResponseEntity<String> updatePhoneNumber(@RequestBody String phoneNumber) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Nem vagy bejelentkezve.");
        }
        user.setPhone_number(phoneNumber);
        userService.saveUser(user);
        return ResponseEntity.ok(phoneNumber);
    }

    @PutMapping("/image")
    public ResponseEntity<String> updateProfileImage(@RequestParam("file") MultipartFile file) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Nem vagy bejelentkezve.");
        }
        userService.updateProfilePicture(user, file);
        return ResponseEntity.ok("Siker");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public UserDTO getUserById(@PathVariable Long id) {
        return userService.findUserById(id)
                .map(UserDTO::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Felhasznalo nem talalhato."));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/role")
    public UserDTO updateUserRole(@PathVariable Long id, @RequestParam("role") String role) {
        UserRole newRole;
        try {
            newRole = UserRole.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ervenytelen szerepkor.");
        }

        User currentUser = getCurrentUser();
        if (currentUser != null && currentUser.getId().equals(id)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sajat szerepkor nem modosithato.");
        }

        User updated = userService.updateUserRole(id, newRole);
        if (updated == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Felhasznalo nem talalhato.");
        }

        return UserDTO.from(updated);
    }

    @GetMapping("/preferences")
    public ResponseEntity<UserPreferencesDto> getUserPreferences() {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UserPreferencesDto preferences = userPreferencesService.getPreferencesFor(user);
        return ResponseEntity.ok(preferences);
    }

    @PutMapping("/preferences")
    public ResponseEntity<UserPreferencesDto> updateUserPreferences(@RequestBody UserPreferencesDto requestBody) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UserPreferencesDto updated = userPreferencesService.updatePreferences(user, requestBody);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/data-export")
    public ResponseEntity<Void> requestDataExport(@RequestBody(required = false) Object payload) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        userDataRequestService.submitRequest(user, UserDataRequestType.DATA_EXPORT, payload);
        return ResponseEntity.accepted().build();
    }

    @GetMapping("/me/export")
    public ResponseEntity<Map<String, Object>> directDataExport() {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Map<String, Object> exportData = userService.exportUserData(user);
        return ResponseEntity.ok(exportData);
    }

    @DeleteMapping("/me")
    public ResponseEntity<?> deleteCurrentUser(@RequestBody PasswordConfirmationRequest request) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        if (!userService.verifyPassword(user, request.getPassword())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(java.util.Collections.singletonMap("message", "Helytelen jelszó. A fiók törléséhez add meg a helyes jelszavad."));
        }

        userService.deleteUser(user.getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/2fa/generate")
    public ResponseEntity<Map<String, String>> generate2FA() {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String secret = authService.generate2FASecret();
        String uri = String.format("otpauth://totp/MediWeb:%s?secret=%s&issuer=MediWeb", user.getEmail(), secret);

        Map<String, String> response = new HashMap<>();
        response.put("secret", secret);
        response.put("uri", uri);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/2fa/enable")
    public ResponseEntity<?> enable2FA(@RequestBody Map<String, String> body) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String secret = body.get("secret");
        String code = body.get("code");

        if (secret == null || code == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Hiányzó adatok."));
        }

        boolean isValid = authService.verify2FACode(secret, code);
        if (isValid) {
            user.setTotpSecret(secret);
            user.setIs2faEnabled(true);
            userService.saveUser(user);
            return ResponseEntity.ok(Map.of("message", "Kétlépcsős azonosítás sikeresen bekapcsolva."));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "A megadott kód helytelen."));
        }
    }

    @PostMapping("/2fa/disable")
    public ResponseEntity<?> disable2FA(@RequestBody Map<String, String> body) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String code = body.get("code");
        if (code == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Hiányzó kód."));
        }

        boolean isValid = authService.verify2FACode(user.getTotpSecret(), code);
        if (isValid) {
            user.setTotpSecret(null);
            user.setIs2faEnabled(false);
            userService.saveUser(user);
            return ResponseEntity.ok(Map.of("message", "Kétlépcsős azonosítás kikapcsolva."));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "A megadott kód helytelen."));
        }
    }
}