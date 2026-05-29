package com.numsbank.admin.repository;

import com.numsbank.admin.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    Optional<Account> findByAccountNumber(String accountNumber);
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
