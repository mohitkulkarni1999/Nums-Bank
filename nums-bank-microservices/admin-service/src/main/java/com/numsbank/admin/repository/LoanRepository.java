package com.numsbank.admin.repository;

import com.numsbank.admin.entity.Loan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {
    List<Loan> findByStatus(String status);
    List<Loan> findByUserId(Long userId);
}
