package hu.project.MediWeb.modules.user.repository;

import hu.project.MediWeb.modules.user.entity.UserDataRequest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserDataRequestRepository extends JpaRepository<UserDataRequest, Long> {
}
