package com.numsbank.auth.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.sql.Timestamp;
import java.time.LocalDateTime;

// @Component
public class DatabaseSeeder implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(JdbcTemplate jdbcTemplate, PasswordEncoder passwordEncoder) {
        this.jdbcTemplate = jdbcTemplate;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // 1. Ensure admin account exists
        Integer adminCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM users WHERE email = 'admin@numsbank.com'", Integer.class);
        
        if (adminCount == null || adminCount == 0) {
            String adminPasswordHash = passwordEncoder.encode("admin@123");
            jdbcTemplate.update(
                    "INSERT INTO users (full_name, email, phone, password_hash, pan_number, aadhar_masked, is_approved, is_active, role, created_at) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    "NUMS Bank Administrator", "admin@numsbank.com", "9999999999", adminPasswordHash,
                    "ADMIB1234F", "XXXX-XXXX-9999", true, true, "ADMIN", Timestamp.valueOf(LocalDateTime.now())
            );
            System.out.println(">>> Admin account seeded via JDBC: admin@numsbank.com / admin@123");
        } else {
            System.out.println(">>> Admin account already exists. Skipping admin seed.");
        }

    }
}
