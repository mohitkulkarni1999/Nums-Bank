package com.numsbank.auth.repository;

import com.numsbank.auth.entity.Nominee;
import com.numsbank.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NomineeRepository extends JpaRepository<Nominee, Long> {
    Optional<Nominee> findFirstByUser(User user);
}
