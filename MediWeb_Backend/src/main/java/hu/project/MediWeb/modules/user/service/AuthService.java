package hu.project.MediWeb.modules.user.service;

import hu.project.MediWeb.modules.user.entity.User;
import hu.project.MediWeb.modules.user.enums.UserRole;
import hu.project.MediWeb.modules.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import hu.project.MediWeb.modules.user.repository.VerificationTokenRepository;
import hu.project.MediWeb.modules.user.entity.VerificationToken;
import hu.project.MediWeb.modules.notification.service.EmailNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Value;

import org.jboss.aerogear.security.otp.Totp;
import org.jboss.aerogear.security.otp.api.Base32;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import java.util.Collections;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private VerificationTokenRepository verificationTokenRepository;

    @Autowired
    private EmailNotificationService emailNotificationService;

    @Value("${google.auth.client-id:}")
    private String googleClientId;

    public User register(User user) {
        System.out.println("🚀 Registration attempt for email: " + user.getEmail());
        
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            System.out.println("❌ Email already exists: " + user.getEmail());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ez az email cím már használatban van!");
        }

        // Check if name is unique too
        if (userRepository.findByName(user.getName()).isPresent()) {
            System.out.println("❌ Name already exists: " + user.getName());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ez a felhasználónév már használatban van!");
        }

        System.out.println("✅ Email and name are unique, proceeding with registration");
        
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(UserRole.USER);
        user.setRegistration_date(java.time.LocalDateTime.now());
        user.setLast_login(java.time.LocalDateTime.now());
        user.setIs_active(false); // User must verify email first

        User savedUser = userRepository.save(user);

        // Generate and send 6-digit verification code
        String code = String.format("%06d", new Random().nextInt(999999));
        
        verificationTokenRepository.deleteAllByEmail(savedUser.getEmail()); // Clear previous tokens
        VerificationToken token = VerificationToken.builder()
                .email(savedUser.getEmail())
                .token(code)
                .expiryDate(LocalDateTime.now().plusMinutes(15))
                .build();
        verificationTokenRepository.save(token);

        System.out.println("⚠️ DEBUG: Verification code for " + savedUser.getEmail() + " is: " + code);
        
        emailNotificationService.sendVerificationEmail(savedUser, code);

        System.out.println("✅ User registered (pending verification) with ID: " + savedUser.getId());
        return savedUser;
    }

    public boolean verifyEmail(String email, String code) {
        VerificationToken token = verificationTokenRepository.findByEmailAndToken(email, code)
                .orElse(null);

        if (token == null || token.isExpired()) {
            return false;
        }

        User user = userRepository.findByEmail(email).orElse(null);
        if (user != null) {
            user.setIs_active(true);
            userRepository.save(user);
            verificationTokenRepository.deleteAllByEmail(email);
            return true;
        }
        return false;
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElse(null);
    }

    public User login(String username, String password) {
        try {
            System.out.println("🔐 Login attempt: " + username);

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
            );

            org.springframework.security.core.userdetails.User userDetails =
                    (org.springframework.security.core.userdetails.User) authentication.getPrincipal();

            // Use email instead of name since CustomUserDetailsService returns email as username
            return userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
        } catch (Exception ex) {
            System.err.println("❌ Login failed: " + ex.getMessage());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Hibás email vagy jelszó.");
        }
    }

    public User getCurrentUser(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("user") == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Nincs bejelentkezve.");
        }
        return (User) session.getAttribute("user");
    }

    public User verifyGoogleToken(String idTokenString) throws Exception {
        if (googleClientId == null || googleClientId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Google Login is not configured on the server.");
        }

        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(googleClientId))
                .build();

        GoogleIdToken idToken = verifier.verify(idTokenString);
        if (idToken != null) {
            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");

            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                // Register the user automatically
                user = new User();
                user.setEmail(email);
                user.setName(name != null ? name : "Google User");
                user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString())); // Random password, they won't use it
                user.setRole(UserRole.USER);
                user.setRegistration_date(LocalDateTime.now());
                user.setLast_login(LocalDateTime.now());
                user.setIs_active(true); // Automatically active because Google verified the email
                user = userRepository.save(user);
                System.out.println("✅ Google User registered automatically: " + email);
            } else {
                // Update last login
                user.setLast_login(LocalDateTime.now());
                // Ensure they are active if they log in with Google
                if (!Boolean.TRUE.equals(user.getIs_active())) {
                    user.setIs_active(true);
                }
                user = userRepository.save(user);
                System.out.println("✅ Google Login successful for: " + email);
            }
            return user;
        } else {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid ID token.");
        }
    }

    public String generate2FASecret() {
        return Base32.random();
    }

    public boolean verify2FACode(String secret, String code) {
        try {
            Totp totp = new Totp(secret);
            return totp.verify(code);
        } catch (Exception e) {
            return false;
        }
    }
}