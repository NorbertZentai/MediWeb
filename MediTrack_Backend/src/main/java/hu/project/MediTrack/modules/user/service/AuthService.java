package hu.project.MediTrack.modules.user.service;

import hu.project.MediTrack.modules.user.entity.User;
import hu.project.MediTrack.modules.user.enums.UserRole;
import hu.project.MediTrack.modules.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User register(User user) {
        if (userRepository.findByName(user.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Error: Email is already in use!");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(UserRole.USER);
        user.setRegistration_date(java.time.LocalDateTime.now());
        user.setLast_login(java.time.LocalDateTime.now());
        user.setIs_active(true);

        return userRepository.save(user);
    }

    public User login(String username, String password) {
        try {
            System.out.println("🔐 Login attempt: " + username);

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
            );

            org.springframework.security.core.userdetails.User userDetails =
                    (org.springframework.security.core.userdetails.User) authentication.getPrincipal();

            return userRepository.findByName(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
        } catch (Exception ex) {
            System.err.println("❌ Login failed: " + ex.getMessage());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Hibás email vagy jelszó.");
        }
    }

    public User getCurrentUser(String email) {
        return userRepository.findByName(email)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
    }
}