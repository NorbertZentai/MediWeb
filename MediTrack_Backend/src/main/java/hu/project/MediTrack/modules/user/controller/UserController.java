package hu.project.MediTrack.modules.user.controller;

import hu.project.MediTrack.modules.user.entity.User;
import hu.project.MediTrack.modules.user.enums.UserRole;
import hu.project.MediTrack.modules.user.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public List<User> getAllUsers() {
        return userService.findAllUsers();
    }

    @GetMapping("/{id}")
    public User getUserById(@PathVariable Integer id) {
        Optional<User> user = userService.findUserById(id);
        return user.orElse(null);
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.saveUser(user);
    }

    @PutMapping("/{id}")
    public User updateUser(@PathVariable Integer id, @RequestBody User updated) {
        Optional<User> existing = userService.findUserById(id);
        if (existing.isPresent()) {
            User user = existing.get();
            user.setName(updated.getName());
            user.setEmail(updated.getEmail());
            user.setGender(updated.getGender());
            user.setDate_of_birth(updated.getDate_of_birth());
            user.setAddress(updated.getAddress());
            user.setPhone_number(updated.getPhone_number());
            user.setProfile_picture(updated.getProfile_picture());
            user.setRole(updated.getRole());
            user.setIs_active(updated.getIs_active());
            user.setLanguage(updated.getLanguage());
            user.setDeleted_at(updated.getDeleted_at());
            return userService.saveUser(user);
        } else {
            return null;
        }
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Integer id) {
        userService.deleteUser(id);
    }

    @PutMapping("/{id}/role")
    public User updateUserRole(@PathVariable Integer id, @RequestParam("role") String role) {
        return userService.updateUserRole(id, UserRole.valueOf(role.toUpperCase()));
    }
}
