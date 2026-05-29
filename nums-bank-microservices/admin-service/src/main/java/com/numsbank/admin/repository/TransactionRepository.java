package com.numsbank.admin.repository;

import com.numsbank.admin.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    Optional<Transaction> findByTransactionId(String transactionId);
    List<Transaction> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
