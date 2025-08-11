package hu.project.MediWeb.modules.user.controller;

import hu.project.MediWeb.modules.user.entity.User;
import hu.project.MediWeb.modules.user.enums.UserRole;
import hu.project.MediWeb.modules.user.service.UserService;
import hu.project.MediWeb.modules.user.dto.PasswordChangeRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    private User getCurrentUser(HttpServletRequest request) {
        return (User) request.getSession().getAttribute("user");
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userService.findAllUsers();
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.saveUser(user);
    }


    @PutMapping("/username")
    public ResponseEntity<String> updateUsername(@RequestBody String username, HttpServletRequest request) {
        User user = getCurrentUser(request);
        user.setName(username);
        userService.saveUser(user);
        return ResponseEntity.ok(username);
    }

    @PutMapping("/email")
    public ResponseEntity<String> updateEmail(@RequestBody String email, HttpServletRequest request) {
        User user = getCurrentUser(request);
        user.setEmail(email);
        userService.saveUser(user);
        return ResponseEntity.ok(email);
    }

    @PutMapping("/password")
    public ResponseEntity<?> updatePassword(@RequestBody PasswordChangeRequest requestBody, HttpServletRequest request) {
        User user = getCurrentUser(request);
        boolean success = userService.changePassword(user, requestBody);

        if (success) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.badRequest().body("Hibás jelenlegi jelszó vagy nem egyező új jelszavak.");
        }
    }

    @PutMapping("/phone")
    public ResponseEntity<String> updatePhoneNumber(@RequestBody String phoneNumber, HttpServletRequest request) {
        User user = getCurrentUser(request);
        user.setPhone_number(phoneNumber);
        userService.saveUser(user);
        return ResponseEntity.ok(phoneNumber);
    }

    @PutMapping("/image")
    public ResponseEntity<String> updateProfileImage(@RequestParam("file") MultipartFile file, HttpServletRequest request) {
        User user = getCurrentUser(request);
        userService.updateProfilePicture(user, file);
        return ResponseEntity.ok("Siker");
    }

    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        Optional<User> user = userService.findUserById(id);
        return user.orElse(null);
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }

    @PutMapping("/{id}/role")
    public User updateUserRole(@PathVariable Long id, @RequestParam("role") String role) {
        return userService.updateUserRole(id, UserRole.valueOf(role.toUpperCase()));
    }
}