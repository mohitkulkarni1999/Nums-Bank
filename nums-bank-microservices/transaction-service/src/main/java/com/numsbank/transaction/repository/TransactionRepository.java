package com.numsbank.transaction.repository;

import com.numsbank.transaction.entity.Account;
import com.numsbank.transaction.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    Optional<Transaction> findByTransactionId(String transactionId);

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT t FROM Transaction t WHERE (t.fromAccount IN :accounts OR t.toAccountNumber IN :accountNumbers) ORDER BY t.createdAt DESC")
    List<Transaction> findAllUserTransactions(@Param("accounts") List<Account> accounts, @Param("accountNumbers") List<String> accountNumbers);

    @Query("SELECT t FROM Transaction t WHERE (t.fromAccount IN :accounts OR t.toAccountNumber IN :accountNumbers) AND t.createdAt BETWEEN :startDate AND :endDate ORDER BY t.createdAt DESC")
    List<Transaction> findUserTransactionsByDate(
        @Param("accounts") List<Account> accounts, 
        @Param("accountNumbers") List<String> accountNumbers, 
        @Param("startDate") LocalDateTime startDate, 
        @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT t FROM Transaction t WHERE (t.fromAccount IN :accounts OR t.toAccountNumber IN :accountNumbers) ORDER BY t.createdAt DESC")
    Page<Transaction> findUserTransactionsPaginated(
        @Param("accounts") List<Account> accounts, 
        @Param("accountNumbers") List<String> accountNumbers, 
        Pageable pageable
    );
}
