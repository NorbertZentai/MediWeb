package hu.project.MediWeb.modules.user.controller;

import hu.project.MediWeb.modules.user.dto.UserDTO;
import hu.project.MediWeb.modules.user.entity.User;
import hu.project.MediWeb.modules.user.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request) {
        request.getSession().invalidate();
        return ResponseEntity.ok("Logout successful");
    }

    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@RequestBody User user) {
        return ResponseEntity.ok(authService.register(user));
    }

    @PostMapping("/login")
    public ResponseEntity<User> loginUser(@RequestBody Map<String, String> credentials, HttpServletRequest request) {
        String username = credentials.get("email");
        String password = credentials.get("password");

        User user = authService.login(username, password);
        HttpSession session = request.getSession(true);
        session.setAttribute("user", user);
        String sessionId = session.getId();

        // Check if we're in production (HTTPS) environment
        boolean isProduction = "https".equals(request.getScheme()) || 
                              request.getHeader("X-Forwarded-Proto") != null;

        ResponseCookie cookie = ResponseCookie.from("Session", sessionId)
                .httpOnly(true)
                .path("/")
                .sameSite("Lax")
                .secure(isProduction) // Use secure cookies in production
                .maxAge(24 * 60 * 60) // 24 hours
                .build();

        System.out.println("🍪 Setting session cookie for user: " + user.getEmail() + ", sessionId: " + sessionId);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(user);
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        System.out.println("🔍 /me endpoint - Session exists: " + (session != null));
        
        if (session != null) {
            System.out.println("🔍 Session ID: " + session.getId());
            Object userAttr = session.getAttribute("user");
            System.out.println("🔍 User in session: " + (userAttr != null));
            if (userAttr != null) {
                User user = (User) userAttr;
                System.out.println("🔍 User email: " + user.getEmail());
                return ResponseEntity.ok(UserDTO.from(user));
            }
        }
        
        System.out.println("❌ No valid session found");
        return ResponseEntity.status(401).build();
    }
}