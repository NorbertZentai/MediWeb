package hu.project.MediTrack.modules.profile.repository;

import hu.project.MediTrack.modules.profile.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfileRepository extends JpaRepository<Profile, Integer> {
}
