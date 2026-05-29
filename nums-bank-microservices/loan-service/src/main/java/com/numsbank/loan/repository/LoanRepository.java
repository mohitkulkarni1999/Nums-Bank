package com.numsbank.loan.repository;

import com.numsbank.loan.entity.Loan;
import com.numsbank.loan.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {
    List<Loan> findByUser(User user);
    List<Loan> findByStatus(String status);
}
