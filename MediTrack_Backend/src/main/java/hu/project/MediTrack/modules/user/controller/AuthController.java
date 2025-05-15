package hu.project.MediTrack.modules.user.controller;

import hu.project.MediTrack.modules.user.entity.User;
import hu.project.MediTrack.modules.user.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
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
        request.getSession().setAttribute("user", user);

        return ResponseEntity.ok(user);
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(HttpServletRequest request) {
        User user = (User) request.getSession().getAttribute("user");

        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(user);
    }
}
