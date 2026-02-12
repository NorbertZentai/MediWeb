package hu.project.MediWeb.modules.notification.repository;

import hu.project.MediWeb.modules.notification.entity.ExpoPushToken;
import hu.project.MediWeb.modules.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExpoPushTokenRepository extends JpaRepository<ExpoPushToken, Long> {

    List<ExpoPushToken> findByUser(User user);

    Optional<ExpoPushToken> findByToken(String token);

    void deleteByToken(String token);
}
