package hu.project.MediWeb.modules.user.controller;

import hu.project.MediWeb.modules.user.dto.UserDTO;
import hu.project.MediWeb.modules.user.entity.User;
import hu.project.MediWeb.modules.user.service.AuthService;
import hu.project.MediWeb.security.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@Slf4j
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;

    @Autowired
    public AuthController(AuthService authService, JwtUtil jwtUtil) {
        this.authService = authService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        // For JWT, logout is handled client-side by removing the token
        return ResponseEntity.ok("Logout successful");
    }

    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@RequestBody User user) {
        try {
            return ResponseEntity.ok(authService.register(user));
        } catch (Exception e) {
            log.error("Registration error: {}", e.getMessage());
            throw e;
        }
    }

    @PostMapping("/verify-email")
    public ResponseEntity<String> verifyEmail(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");
        
        if (email == null || code == null) {
            return ResponseEntity.badRequest().body("Hiányzó email vagy kód");
        }

        boolean success = authService.verifyEmail(email, code);
        if (success) {
            return ResponseEntity.ok("Email cím sikeresen megerősítve.");
        } else {
            return ResponseEntity.status(400).body("A kód helytelen vagy lejárt.");
        }
    }

    @PostMapping("/google")
    public ResponseEntity<Map<String, Object>> googleLogin(@RequestBody Map<String, String> body) {
        try {
            String idToken = body.get("idToken");
            if (idToken == null || idToken.isBlank()) {
                return ResponseEntity.badRequest().build();
            }

            User user = authService.verifyGoogleToken(idToken);
            String jwtToken = jwtUtil.generateJwtToken(user.getEmail());

            Map<String, Object> response = new HashMap<>();
            response.put("user", user);
            response.put("token", jwtToken);
            response.put("type", "Bearer");

            log.debug("JWT token generated for Google user: {}", user.getEmail());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Google Login error: {}", e.getMessage(), e);
            return ResponseEntity.status(401).build();
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginUser(@RequestBody Map<String, String> credentials) {
        try {
            String username = credentials.get("email");
            String password = credentials.get("password");
            String code = credentials.get("code"); // Optional 2FA code

            log.debug("Login attempt for email: {}", username);

            User user = authService.login(username, password);

            // Check if 2FA is enabled
            if (Boolean.TRUE.equals(user.getIs2faEnabled())) {
                if (code == null || code.isBlank()) {
                    Map<String, Object> response = new HashMap<>();
                    response.put("requires2fa", true);
                    return ResponseEntity.ok(response);
                }

                boolean isCodeValid = authService.verify2FACode(user.getTotpSecret(), code);
                if (!isCodeValid) {
                    return ResponseEntity.status(401).body(Map.of("message", "Hibás 2FA kód!"));
                }
            }

            String jwtToken = jwtUtil.generateJwtToken(user.getEmail());

            // Create response with user data and JWT token
            Map<String, Object> response = new HashMap<>();
            response.put("user", user);
            response.put("token", jwtToken);
            response.put("type", "Bearer");

            log.debug("JWT token generated for user: {}", user.getEmail());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Login error: {}", e.getMessage(), e);
            throw e;
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refreshToken(@RequestBody Map<String, String> body) {
        String expiredToken = body.get("token");
        if (expiredToken == null || expiredToken.isBlank()) {
            return ResponseEntity.status(401).build();
        }

        try {
            String email = jwtUtil.getEmailFromExpiredToken(expiredToken);
            if (email == null) {
                return ResponseEntity.status(401).build();
            }

            // Verify the user still exists and is active
            User user = authService.findByEmail(email);
            if (user == null || !Boolean.TRUE.equals(user.getIs_active())) {
                return ResponseEntity.status(401).build();
            }

            String newToken = jwtUtil.generateJwtToken(email);

            Map<String, Object> response = new HashMap<>();
            response.put("token", newToken);
            response.put("type", "Bearer");

            log.debug("Token refreshed for user: {}", email);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.warn("Token refresh failed: {}", e.getMessage());
            return ResponseEntity.status(401).build();
        }
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication != null && authentication.isAuthenticated()) {
                String email = authentication.getName();
                log.debug("JWT authenticated user: {}", email);

                User user = authService.findByEmail(email);
                if (user != null) {
                    return ResponseEntity.ok(UserDTO.from(user));
                }
            }

            log.debug("No valid JWT authentication found");
            return ResponseEntity.status(401).build();
        } catch (Exception e) {
            log.error("/auth/me error: {}", e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }
}
