package com.numsbank.auth.repository;

import com.numsbank.auth.entity.TransactionPin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransactionPinRepository extends JpaRepository<TransactionPin, Long> {
}
