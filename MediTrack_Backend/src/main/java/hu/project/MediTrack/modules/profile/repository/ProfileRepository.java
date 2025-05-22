package hu.project.MediTrack.modules.profile.repository;

import hu.project.MediTrack.modules.profile.entity.Profile;
import hu.project.MediTrack.modules.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProfileRepository extends JpaRepository<Profile, Long> {
    List<Profile> findAllByUser(User user);
}