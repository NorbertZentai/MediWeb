package hu.project.MediWeb.modules.profile.service;

import hu.project.MediWeb.modules.profile.dto.ProfileDTO;
import hu.project.MediWeb.modules.profile.entity.Profile;
import hu.project.MediWeb.modules.profile.repository.ProfileRepository;
import hu.project.MediWeb.modules.user.entity.User;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProfileService {

    @Autowired
    private ProfileRepository profileRepository;

    @Transactional
    public List<ProfileDTO> findByUser(User user) {
        return profileRepository.findAllByUser(user).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProfileDTO findById(Long id) {
        return profileRepository.findById(id)
                .map(this::convertToDTO)
                .orElse(null);
    }

    @Transactional
    public ProfileDTO saveProfile(Profile profile) {
        Profile saved = profileRepository.save(profile);
        return convertToDTO(saved);
    }

    @Transactional
    public ProfileDTO updateProfile(Long id, Profile updatedProfile) {
        return profileRepository.findById(id)
                .map(existing -> {
                    existing.setName(updatedProfile.getName());
                    existing.setNotes(updatedProfile.getNotes());
                    Profile saved = profileRepository.save(existing);
                    return convertToDTO(saved);
                })
                .orElseThrow(() -> new IllegalArgumentException("Profil nem található ezzel az ID-val: " + id));
    }

    @Transactional
    public void deleteById(Long id) {
        profileRepository.deleteById(id);
    }

    private ProfileDTO convertToDTO(Profile profile) {
        return ProfileDTO.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .name(profile.getName())
                .notes(profile.getNotes())
                .build();
    }
}