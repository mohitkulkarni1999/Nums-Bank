package com.numsbank.auth.repository;

import com.numsbank.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPanNumber(String panNumber);
    boolean existsByEmail(String email);
    boolean existsByPanNumber(String panNumber);
}
