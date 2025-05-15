package hu.project.MediTrack.modules.medication.controller;

import hu.project.MediTrack.modules.medication.entity.MedicationComment;
import hu.project.MediTrack.modules.medication.service.MedicationCommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/medication-comments")
public class MedicationCommentController {

    @Autowired
    private MedicationCommentService commentService;

    @GetMapping
    public List<MedicationComment> getAllComments() {
        return commentService.findAll();
    }

    @GetMapping("/{id}")
    public MedicationComment getCommentById(@PathVariable Integer id) {
        Optional<MedicationComment> comment = commentService.findById(id);
        return comment.orElse(null);
    }

    @PostMapping
    public MedicationComment createComment(@RequestBody MedicationComment comment) {
        return commentService.save(comment);
    }

    @PutMapping("/{id}")
    public MedicationComment updateComment(@PathVariable Integer id,
                                           @RequestBody MedicationComment updated) {
        return commentService.findById(id).map(c -> {
            c.setComment(updated.getComment());
            c.setDate(updated.getDate());
            c.setMedication(updated.getMedication());
            c.setUser(updated.getUser());
            return commentService.save(c);
        }).orElse(null);
    }

    @DeleteMapping("/{id}")
    public void deleteComment(@PathVariable Integer id) {
        commentService.deleteById(id);
    }
}
