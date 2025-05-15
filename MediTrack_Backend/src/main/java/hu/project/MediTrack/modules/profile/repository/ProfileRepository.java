package hu.project.MediTrack.modules.profile.repository;

import hu.project.MediTrack.modules.profile.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * A Profile entitáshoz tartozó adattárolási műveletek.
 */
public interface ProfileRepository extends JpaRepository<Profile, Integer> {
    // Egyedi lekérdezések, pl. List<Profile> findByNameContaining(String partialName);
}
