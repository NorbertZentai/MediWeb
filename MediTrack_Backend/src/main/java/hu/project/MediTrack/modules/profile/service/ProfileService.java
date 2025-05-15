package hu.project.MediTrack.modules.profile.service;

import hu.project.MediTrack.modules.profile.entity.Profile;
import hu.project.MediTrack.modules.profile.repository.ProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Üzleti logika a Profile entitáshoz kapcsolódóan.
 */
@Service
public class ProfileService {

    @Autowired
    private ProfileRepository profileRepository;

    public List<Profile> findAll() {
        return profileRepository.findAll();
    }

    public Optional<Profile> findById(Integer id) {
        return profileRepository.findById(id);
    }

    public Profile saveProfile(Profile profile) {
        // Itt lehet plusz logika: pl. validálás, eseményküldés stb.
        return profileRepository.save(profile);
    }

    public void deleteById(Integer id) {
        profileRepository.deleteById(id);
    }
}
