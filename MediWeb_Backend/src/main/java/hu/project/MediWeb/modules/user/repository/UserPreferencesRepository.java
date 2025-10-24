package hu.project.MediWeb.modules.user.repository;

import hu.project.MediWeb.modules.user.entity.User;
import hu.project.MediWeb.modules.user.entity.UserPreferences;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserPreferencesRepository extends JpaRepository<UserPreferences, Long> {

    Optional<UserPreferences> findByUser(User user);
}
