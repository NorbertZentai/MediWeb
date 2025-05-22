package hu.project.MediTrack.modules.profile.service;

import hu.project.MediTrack.modules.profile.entity.Profile;
import hu.project.MediTrack.modules.profile.repository.ProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

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
        return profileRepository.save(profile);
    }

    public Profile updateProfile(Integer id, Profile updatedProfile) {
        return profileRepository.findById(id)
                .map(existing -> {
                    existing.setName(updatedProfile.getName());
                    existing.setNotes(updatedProfile.getNotes());
                    return profileRepository.save(existing);
                })
                .orElseThrow(() -> new IllegalArgumentException("Profil nem található ezzel az ID-val: " + id));
    }

    public void deleteById(Integer id) {
        profileRepository.deleteById(id);
    }
}