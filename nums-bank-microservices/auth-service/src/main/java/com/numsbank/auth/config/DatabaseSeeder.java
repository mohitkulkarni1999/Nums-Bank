package com.numsbank.auth.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
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

        // 2. Check if other users exist
        Integer userCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users", Integer.class);
        if (userCount != null && userCount > 1) {
            System.out.println(">>> Sample data already seeded. Skipping seeder.");
            return;
        }

        System.out.println(">>> Starting NUMS BANK Operations Database Seeding via JDBC...");

        String standardPasswordHash = passwordEncoder.encode("password123");
        String standardPinHash = passwordEncoder.encode("123456");

        // Seed Users
        // Amit Sharma (ID: 2)
        jdbcTemplate.update(
                "INSERT INTO users (id, full_name, email, phone, password_hash, pan_number, aadhar_masked, is_approved, is_active, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                2L, "Amit Sharma", "amit@gmail.com", "9876543210", standardPasswordHash, "ABCDE1234F", "XXXX-XXXX-1234", true, true, "USER", Timestamp.valueOf(LocalDateTime.now())
        );

        // Priya Patel (ID: 3)
        jdbcTemplate.update(
                "INSERT INTO users (id, full_name, email, phone, password_hash, pan_number, aadhar_masked, is_approved, is_active, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                3L, "Priya Patel", "priya@gmail.com", "9876543211", standardPasswordHash, "FGHIJ5678G", "XXXX-XXXX-5678", true, true, "USER", Timestamp.valueOf(LocalDateTime.now())
        );

        // Rahul Verma (ID: 4)
        jdbcTemplate.update(
                "INSERT INTO users (id, full_name, email, phone, password_hash, pan_number, aadhar_masked, is_approved, is_active, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                4L, "Rahul Verma", "rahul@gmail.com", "9876543212", standardPasswordHash, "KLMNO9012H", "XXXX-XXXX-9012", true, true, "USER", Timestamp.valueOf(LocalDateTime.now())
        );

        // Sneha Reddi (ID: 5)
        jdbcTemplate.update(
                "INSERT INTO users (id, full_name, email, phone, password_hash, pan_number, aadhar_masked, is_approved, is_active, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                5L, "Sneha Reddi", "sneha@gmail.com", "9876543213", standardPasswordHash, "PQRST3456I", "XXXX-XXXX-3456", false, true, "USER", Timestamp.valueOf(LocalDateTime.now())
        );

        // Seed Accounts
        jdbcTemplate.update(
                "INSERT INTO accounts (user_id, account_number, account_type, balance, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                2L, "SAV10001234", "SAVINGS", new BigDecimal("125000.50"), true, Timestamp.valueOf(LocalDateTime.now())
        );
        jdbcTemplate.update(
                "INSERT INTO accounts (user_id, account_number, account_type, balance, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                2L, "CUR10005678", "CURRENT", new BigDecimal("450000.00"), true, Timestamp.valueOf(LocalDateTime.now())
        );
        jdbcTemplate.update(
                "INSERT INTO accounts (user_id, account_number, account_type, balance, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                3L, "SAV10005678", "SAVINGS", new BigDecimal("85000.75"), true, Timestamp.valueOf(LocalDateTime.now())
        );
        jdbcTemplate.update(
                "INSERT INTO accounts (user_id, account_number, account_type, balance, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                4L, "SAV10009012", "SAVINGS", new BigDecimal("12000.00"), true, Timestamp.valueOf(LocalDateTime.now())
        );
        jdbcTemplate.update(
                "INSERT INTO accounts (user_id, account_number, account_type, balance, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                5L, "SAV10003456", "SAVINGS", new BigDecimal("5000.00"), true, Timestamp.valueOf(LocalDateTime.now())
        );

        // Seed Transaction Pins
        jdbcTemplate.update("INSERT INTO transaction_pin (user_id, pin_hash, failed_attempts, is_locked) VALUES (?, ?, ?, ?)", 2L, standardPinHash, 0, false);
        jdbcTemplate.update("INSERT INTO transaction_pin (user_id, pin_hash, failed_attempts, is_locked) VALUES (?, ?, ?, ?)", 3L, standardPinHash, 0, false);
        jdbcTemplate.update("INSERT INTO transaction_pin (user_id, pin_hash, failed_attempts, is_locked) VALUES (?, ?, ?, ?)", 4L, standardPinHash, 0, false);
        jdbcTemplate.update("INSERT INTO transaction_pin (user_id, pin_hash, failed_attempts, is_locked) VALUES (?, ?, ?, ?)", 5L, standardPinHash, 0, false);

        // Seed Beneficiaries
        jdbcTemplate.update(
                "INSERT INTO beneficiaries (user_id, beneficiary_name, account_number, ifsc_code, bank_name, is_active) VALUES (?, ?, ?, ?, ?, ?)",
                2L, "Priya Patel", "SAV10005678", "UTIB0000001", "Axis Bank", true
        );
        jdbcTemplate.update(
                "INSERT INTO beneficiaries (user_id, beneficiary_name, account_number, ifsc_code, bank_name, is_active) VALUES (?, ?, ?, ?, ?, ?)",
                2L, "Rahul Verma", "SAV10009012", "HDFC0000010", "HDFC Bank", true
        );

        // Seed Loans
        jdbcTemplate.update(
                "INSERT INTO loans (user_id, loan_type, principal_amount, remaining_amount, interest_rate, tenure_months, emi_amount, next_emi_date, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                2L, "HOME", new BigDecimal("2500000.00"), new BigDecimal("2450000.00"), new BigDecimal("8.50"), 240, new BigDecimal("21696.00"), java.sql.Date.valueOf(LocalDate.now().plusDays(15)), "ACTIVE", Timestamp.valueOf(LocalDateTime.now())
        );
        jdbcTemplate.update(
                "INSERT INTO loans (user_id, loan_type, principal_amount, remaining_amount, interest_rate, tenure_months, emi_amount, next_emi_date, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                2L, "CAR", new BigDecimal("500000.00"), new BigDecimal("320000.00"), new BigDecimal("9.20"), 60, new BigDecimal("10428.00"), java.sql.Date.valueOf(LocalDate.now().plusDays(20)), "ACTIVE", Timestamp.valueOf(LocalDateTime.now())
        );

        // Seed Transactions
        // Find Amit's Savings Account ID
        Long amitSavingsId = jdbcTemplate.queryForObject("SELECT id FROM accounts WHERE account_number = 'SAV10001234'", Long.class);

        jdbcTemplate.update(
                "INSERT INTO transactions (transaction_id, from_account_id, to_account_number, amount, remarks, status, transaction_type, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                "TXN1628374901", null, "SAV10001234", new BigDecimal("50000.00"), "Initial Deposit", "SUCCESS", "IMPS", Timestamp.valueOf(LocalDateTime.now().minusDays(8))
        );
        jdbcTemplate.update(
                "INSERT INTO transactions (transaction_id, from_account_id, to_account_number, amount, remarks, status, transaction_type, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                "TXN1628374902", amitSavingsId, "SAV10005678", new BigDecimal("5000.00"), "Rent payment", "SUCCESS", "NEFT", Timestamp.valueOf(LocalDateTime.now().minusDays(7))
        );
        jdbcTemplate.update(
                "INSERT INTO transactions (transaction_id, from_account_id, to_account_number, amount, remarks, status, transaction_type, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                "TXN1628374903", amitSavingsId, "SAV10009012", new BigDecimal("1500.00"), "Dinner pool", "SUCCESS", "IMPS", Timestamp.valueOf(LocalDateTime.now().minusDays(6))
        );
        jdbcTemplate.update(
                "INSERT INTO transactions (transaction_id, from_account_id, to_account_number, amount, remarks, status, transaction_type, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                "TXN1628374904", amitSavingsId, "SAV10005678", new BigDecimal("25000.00"), "Consulting fee", "SUCCESS", "RTGS", Timestamp.valueOf(LocalDateTime.now().minusDays(5))
        );
        jdbcTemplate.update(
                "INSERT INTO transactions (transaction_id, from_account_id, to_account_number, amount, remarks, status, transaction_type, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                "TXN1628374905", amitSavingsId, "SAV10003456", new BigDecimal("2000.00"), "Gift to Sneha", "FAILED", "IMPS", Timestamp.valueOf(LocalDateTime.now().minusDays(3))
        );
        jdbcTemplate.update(
                "INSERT INTO transactions (transaction_id, from_account_id, to_account_number, amount, remarks, status, transaction_type, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                "TXN1628374906", amitSavingsId, "SAV10005678", new BigDecimal("3500.00"), "Electricity Bill", "SUCCESS", "NEFT", Timestamp.valueOf(LocalDateTime.now().minusDays(2))
        );
        jdbcTemplate.update(
                "INSERT INTO transactions (transaction_id, from_account_id, to_account_number, amount, remarks, status, transaction_type, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                "TXN1628374907", amitSavingsId, "SAV10009012", new BigDecimal("800.00"), "Pending splitting bill", "PENDING", "IMPS", Timestamp.valueOf(LocalDateTime.now().minusDays(1))
        );
        jdbcTemplate.update(
                "INSERT INTO transactions (transaction_id, from_account_id, to_account_number, amount, remarks, status, transaction_type, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                "TXN1628374908", null, "SAV10001234", new BigDecimal("15000.00"), "ATM Cash Deposit", "SUCCESS", "IMPS", Timestamp.valueOf(LocalDateTime.now())
        );

        System.out.println(">>> NUMS BANK Operations Database successfully pre-seeded with all tables via JDBC!");
    }
}
