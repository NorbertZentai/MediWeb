package hu.project.MediWeb.modules.review.repository;

import hu.project.MediWeb.modules.review.entity.ReviewReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewReportRepository extends JpaRepository<ReviewReport, Long> {

    boolean existsByReviewIdAndReporterId(Long reviewId, Long reporterId);

    List<ReviewReport> findByReviewId(Long reviewId);

    Page<ReviewReport> findAllBy(Pageable pageable);

    void deleteByReviewId(Long reviewId);

    long countByReviewId(Long reviewId);
}
