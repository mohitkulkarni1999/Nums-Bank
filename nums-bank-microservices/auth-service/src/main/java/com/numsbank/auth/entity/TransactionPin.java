package com.numsbank.auth.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "transaction_pin")
public class TransactionPin {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "pin_hash", nullable = false)
    private String pinHash;

    @Column(name = "failed_attempts")
    private Integer failedAttempts = 0;

    @Column(name = "is_locked")
    private Boolean isLocked = false;

    public TransactionPin() {}

    public TransactionPin(Long userId, String pinHash) {
        this.userId = userId;
        this.pinHash = pinHash;
        this.failedAttempts = 0;
        this.isLocked = false;
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getPinHash() { return pinHash; }
    public void setPinHash(String pinHash) { this.pinHash = pinHash; }
    public Integer getFailedAttempts() { return failedAttempts; }
    public void setFailedAttempts(Integer failedAttempts) { this.failedAttempts = failedAttempts; }
    public Boolean getIsLocked() { return isLocked; }
    public void setIsLocked(Boolean locked) { isLocked = locked; }
}
