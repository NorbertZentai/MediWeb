package hu.project.MediWeb.modules.user.repository;

import hu.project.MediWeb.modules.user.entity.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import jakarta.transaction.Transactional;

import java.util.Optional;

@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {

    Optional<VerificationToken> findByEmailAndToken(String email, String token);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM VerificationToken t WHERE t.email = ?1")
    void deleteAllByEmail(String email);
}
