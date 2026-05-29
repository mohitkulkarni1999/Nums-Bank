package com.numsbank.transaction.repository;

import com.numsbank.transaction.entity.Beneficiary;
import com.numsbank.transaction.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BeneficiaryRepository extends JpaRepository<Beneficiary, Long> {
    List<Beneficiary> findByUserAndIsActiveTrue(User user);
    Optional<Beneficiary> findByUserAndAccountNumber(User user, String accountNumber);
}
