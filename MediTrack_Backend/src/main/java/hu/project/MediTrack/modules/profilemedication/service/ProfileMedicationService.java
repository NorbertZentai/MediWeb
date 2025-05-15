package hu.project.MediTrack.modules.profilemedication.service;

import hu.project.MediTrack.modules.profilemedication.entity.ProfileMedication;
import hu.project.MediTrack.modules.profilemedication.repository.ProfileMedicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProfileMedicationService {

    @Autowired
    private ProfileMedicationRepository pmRepository;

    public List<ProfileMedication> findAll() {
        return pmRepository.findAll();
    }

    public Optional<ProfileMedication> findById(Integer id) {
        return pmRepository.findById(id);
    }

    public ProfileMedication save(ProfileMedication profileMedication) {
        // Ide illeszthetsz további logikát, pl. validálás
        // vagy ellenőrzés, hogy a profile és medication létezik-e
        return pmRepository.save(profileMedication);
    }

    public void deleteById(Integer id) {
        pmRepository.deleteById(id);
    }

    // Példa: Keresés profileID alapján
    // public List<ProfileMedication> findByProfileId(Integer profileId) {
    //     return pmRepository.findByProfileId(profileId);
    // }
}
