package hu.project.MediTrack.modules.medication.service;

import hu.project.MediTrack.modules.medication.entity.MedicationComment;
import hu.project.MediTrack.modules.medication.repository.MedicationCommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MedicationCommentService {

    @Autowired
    private MedicationCommentRepository commentRepository;

    public List<MedicationComment> findAll() {
        return commentRepository.findAll();
    }

    public Optional<MedicationComment> findById(Integer id) {
        return commentRepository.findById(id);
    }

    public MedicationComment save(MedicationComment comment) {
        // Itt lehetne pl. további logika, pl. spam-check
        return commentRepository.save(comment);
    }

    public void deleteById(Integer id) {
        commentRepository.deleteById(id);
    }
}
