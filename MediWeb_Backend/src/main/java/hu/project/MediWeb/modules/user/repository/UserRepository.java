package hu.project.MediWeb.modules.user.repository;

import hu.project.MediWeb.modules.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByName(String username);
    Optional<User> findByEmail(String email);

    Page<User> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String name, String email, Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(u) FROM User u WHERE u.is_active = ?1")
    long countByIsActive(boolean isActive);
}
