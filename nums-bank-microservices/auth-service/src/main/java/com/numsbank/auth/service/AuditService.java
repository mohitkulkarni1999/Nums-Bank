package com.numsbank.auth.service;

import com.numsbank.auth.entity.AuditLog;
import com.numsbank.auth.repository.AuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Async
    public void log(Long userId, String userEmail, String eventType, String description, String ipAddress) {
        try {
            AuditLog log = new AuditLog(userId, userEmail, eventType, description, ipAddress);
            auditLogRepository.save(log);
        } catch (Exception ex) {
            System.err.println("[AUDIT] Failed to persist audit log: " + ex.getMessage());
        }
    }

    public Page<AuditLog> getUserAuditLogs(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return auditLogRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    public Page<AuditLog> getAllAuditLogs(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);
    }
}
