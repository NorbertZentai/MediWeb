package hu.project.MediWeb.modules.user.service;

import hu.project.MediWeb.modules.user.dto.PasswordChangeRequest;
import hu.project.MediWeb.modules.user.entity.User;
import hu.project.MediWeb.modules.user.enums.UserRole;
import hu.project.MediWeb.modules.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public User getCurrentUser(HttpServletRequest request) {
        return (User) request.getSession().getAttribute("user");
    }

    @Transactional
    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public Optional<User> findUserById(Long id) {
        return userRepository.findById(id);
    }

    @Transactional
    public Optional<User> findUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Transactional
    public User saveUser(User user) {
        if (user.getRegistration_date() == null) {
            user.setRegistration_date(LocalDateTime.now());
        }
        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        jdbcTemplate.update("DELETE FROM favorites WHERE user_id = ?", id);
        jdbcTemplate.update("DELETE FROM reviews WHERE user_id = ?", id);
        jdbcTemplate.update("DELETE FROM profiles WHERE user_id = ?", id);
        userRepository.deleteById(id);
    }

    @Transactional
    public User updateUserRole(Long userId, UserRole newRole) {
        return userRepository.findById(userId)
                .map(u -> {
                    u.setRole(newRole);
                    return userRepository.save(u);
                })
                .orElse(null);
    }

    @Transactional
    public boolean changePassword(User user, PasswordChangeRequest request) {
        boolean valid = passwordEncoder.matches(request.getCurrentPassword(), user.getPassword());
        boolean matchingNewPasswords = request.getNewPassword().equals(request.getReNewPassword());

        if (valid && matchingNewPasswords) {
            String encoded = passwordEncoder.encode(request.getNewPassword());
            user.setPassword(encoded);
            userRepository.save(user);
            return true;
        } else {
            return false;
        }
    }

    public boolean verifyPassword(User user, String rawPassword) {
        if (user == null || rawPassword == null) {
            return false;
        }
        return passwordEncoder.matches(rawPassword, user.getPassword());
    }

    @Transactional
    public void updateProfilePicture(User user, MultipartFile file) {
        try {
            byte[] bytes = file.getBytes();
            user.setProfile_picture(bytes);
            userRepository.save(user);
        } catch (IOException e) {
            throw new RuntimeException("Nem sikerült elmenteni a profilképet.", e);
        }
    }

    public Map<String, Object> exportUserData(User user) {
        Map<String, Object> exportData = new HashMap<>();

        // 1. User Profile Data
        Map<String, Object> userData = new HashMap<>();
        userData.put("name", user.getName());
        userData.put("email", user.getEmail());
        userData.put("registration_date", user.getRegistration_date());
        userData.put("last_login", user.getLast_login());
        userData.put("gender", user.getGender());
        userData.put("date_of_birth", user.getDate_of_birth());
        userData.put("address", user.getAddress());
        userData.put("phone_number", user.getPhone_number());
        userData.put("language", user.getLanguage());
        exportData.put("user_info", userData);

        // 2. Preferences
        List<Map<String, Object>> preferences = jdbcTemplate.queryForList(
                "SELECT preferences_payload, updated_at FROM user_preferences WHERE user_id = ?",
                user.getId());
        exportData.put("preferences", preferences);

        // 3. Profiles
        List<Map<String, Object>> profiles = jdbcTemplate.queryForList(
                "SELECT id, name, notes FROM profiles WHERE user_id = ?",
                user.getId());
        
        for (Map<String, Object> profile : profiles) {
            Long profileId = ((Number) profile.get("id")).longValue();
            
            // 4. Medications for profile
            List<Map<String, Object>> profileMedications = jdbcTemplate.queryForList(
                    "SELECT pm.id, pm.notes, pm.reminders, pm.added_at, m.name AS medication_name, m.atc_code " +
                    "FROM profile_medications pm " +
                    "JOIN medications m ON pm.medication_id = m.id " +
                    "WHERE pm.profile_id = ?", profileId);

            for (Map<String, Object> pm : profileMedications) {
                Long pmId = ((Number) pm.get("id")).longValue();
                
                // 5. Intakes for medication
                List<Map<String, Object>> intakes = jdbcTemplate.queryForList(
                        "SELECT intake_date, intake_time, taken FROM medication_intake_log WHERE profile_medication_id = ?",
                        pmId);
                pm.put("intakes", intakes);
            }
            
            profile.put("medications", profileMedications);
        }
        exportData.put("profiles", profiles);

        // 6. Favorites
        List<Map<String, Object>> favorites = jdbcTemplate.queryForList(
                "SELECT m.name AS medication_name, m.registration_number " +
                "FROM favorites f " +
                "JOIN medications m ON f.medication_id = m.id " +
                "WHERE f.user_id = ?", user.getId());
        exportData.put("favorites", favorites);

        // 7. Reviews
        List<Map<String, Object>> reviews = jdbcTemplate.queryForList(
                "SELECT r.rating, r.positive, r.negative, r.created_at, m.name AS medication_name " +
                "FROM reviews r " +
                "JOIN medications m ON r.item_id = m.id " +
                "WHERE r.user_id = ?", user.getId());
        exportData.put("reviews", reviews);

        return exportData;
    }
}
