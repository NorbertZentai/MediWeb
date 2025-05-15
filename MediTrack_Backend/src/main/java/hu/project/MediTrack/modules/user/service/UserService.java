package hu.project.MediTrack.modules.user.service;

import hu.project.MediTrack.modules.user.entity.User;
import hu.project.MediTrack.modules.user.enums.UserRole;
import hu.project.MediTrack.modules.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> findUserById(Integer id) {
        return userRepository.findById(id);
    }

    public Optional<User> findUserByEmail(String email) {
        return userRepository.findByName(email);
    }

    public User saveUser(User user) {
        if (user.getRegistration_date() == null) {
            user.setRegistration_date(LocalDateTime.now());
        }
        return userRepository.save(user);
    }

    public void deleteUser(Integer id) {
        userRepository.deleteById(id);
    }

    public User updateUserRole(Integer userId, UserRole newRole) {
        return userRepository.findById(userId)
                .map(u -> {
                    u.setRole(newRole);
                    return userRepository.save(u);
                })
                .orElse(null);
    }
}
