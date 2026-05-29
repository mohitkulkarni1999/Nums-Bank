package com.numsbank.auth.service;

import com.numsbank.auth.entity.LoginAttempt;
import com.numsbank.auth.repository.LoginAttemptRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class LoginAttemptService {

    private static final int MAX_ATTEMPTS = 5;
    private static final int LOCK_DURATION_MINUTES = 15;

    private final LoginAttemptRepository loginAttemptRepository;

    public LoginAttemptService(LoginAttemptRepository loginAttemptRepository) {
        this.loginAttemptRepository = loginAttemptRepository;
    }

    public boolean isLocked(String email) {
        return loginAttemptRepository.findByEmail(email)
                .map(LoginAttempt::isCurrentlyLocked)
                .orElse(false);
    }

    public LocalDateTime getLockedUntil(String email) {
        return loginAttemptRepository.findByEmail(email)
                .map(LoginAttempt::getLockedUntil)
                .orElse(null);
    }

    @Transactional
    public void recordFailure(String email) {
        LoginAttempt attempt = loginAttemptRepository.findByEmail(email)
                .orElse(new LoginAttempt(email));

        if (attempt.getLockedUntil() != null && LocalDateTime.now().isAfter(attempt.getLockedUntil())) {
            attempt.setFailedCount(0);
            attempt.setLockedUntil(null);
        }

        attempt.setFailedCount(attempt.getFailedCount() + 1);
        attempt.setLastAttemptAt(LocalDateTime.now());

        if (attempt.getFailedCount() >= MAX_ATTEMPTS) {
            attempt.setLockedUntil(LocalDateTime.now().plusMinutes(LOCK_DURATION_MINUTES));
        }

        loginAttemptRepository.save(attempt);
    }

    @Transactional
    public void recordSuccess(String email) {
        loginAttemptRepository.findByEmail(email).ifPresent(attempt -> {
            attempt.setFailedCount(0);
            attempt.setLockedUntil(null);
            loginAttemptRepository.save(attempt);
        });
    }
}
