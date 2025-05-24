package hu.project.MediTrack.modules.notification.repository;

import hu.project.MediTrack.modules.notification.entity.PushSubscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, Long> {
    List<PushSubscription> findByUserId(Long userId);
}