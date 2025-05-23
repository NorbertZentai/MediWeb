package hu.project.MediTrack.modules.user.service;

import hu.project.MediTrack.modules.user.dto.PasswordChangeRequest;
import hu.project.MediTrack.modules.user.entity.User;
import hu.project.MediTrack.modules.user.enums.UserRole;
import hu.project.MediTrack.modules.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

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
        return userRepository.findByName(email);
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
}
