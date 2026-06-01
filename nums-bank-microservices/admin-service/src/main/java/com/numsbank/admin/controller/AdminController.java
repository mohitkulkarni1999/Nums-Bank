package com.numsbank.admin.controller;

import com.numsbank.admin.config.JwtTokenProvider;
import com.numsbank.admin.entity.Account;
import com.numsbank.admin.entity.Loan;
import com.numsbank.admin.entity.Transaction;
import com.numsbank.admin.entity.User;
import com.numsbank.admin.exception.CustomException;
import com.numsbank.admin.repository.AccountRepository;
import com.numsbank.admin.repository.LoanRepository;
import com.numsbank.admin.repository.TransactionRepository;
import com.numsbank.admin.repository.UserRepository;
import com.numsbank.admin.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "https://nums-bank.vercel.app", allowCredentials = "true")
public class AdminController {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final LoanRepository loanRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserService userService;

    public AdminController(UserRepository userRepository,
                           AccountRepository accountRepository,
                           TransactionRepository transactionRepository,
                           LoanRepository loanRepository,
                           AuthenticationManager authenticationManager,
                           JwtTokenProvider tokenProvider,
                           UserService userService) {
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.loanRepository = loanRepository;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userService = userService;
    }

    @PostMapping("/auth/login")
    public ResponseEntity<?> adminLogin(@Valid @RequestBody AdminLoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String jwt = tokenProvider.generateToken(authentication);
        String role = tokenProvider.getRoleFromJWT(jwt);

        if (!"ADMIN".equals(role)) {
            throw new CustomException(
                "Access denied. This portal is restricted to authorized bank administrators only.",
                HttpStatus.FORBIDDEN
            );
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CustomException("Admin account not found.", HttpStatus.NOT_FOUND));

        Map<String, Object> response = new HashMap<>();
        response.put("token", jwt);
        response.put("userDetails", userService.toSafeUserResponse(user));

        return ResponseEntity.ok(response);
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> safeUsers = users.stream()
                .map(userService::toSafeUserResponse)
                .toList();
        return ResponseEntity.ok(safeUsers);
    }

    @PutMapping("/users/{userId}/approve")
    public ResponseEntity<?> approveUser(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("User not found.", HttpStatus.NOT_FOUND));

        user.setIsApproved(true);
        userRepository.save(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "User " + user.getFullName() + " approved successfully.");

        return ResponseEntity.ok(response);
    }

    @PutMapping("/users/{userId}/deactivate")
    public ResponseEntity<?> deactivateUser(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("User not found.", HttpStatus.NOT_FOUND));

        if ("ADMIN".equals(user.getRole())) {
            throw new CustomException("Cannot deactivate an admin account.", HttpStatus.FORBIDDEN);
        }

        user.setIsActive(false);
        userRepository.save(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "User " + user.getFullName() + " deactivated successfully.");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/users/{userId}/activate")
    public ResponseEntity<?> activateUser(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("User not found.", HttpStatus.NOT_FOUND));

        user.setIsActive(true);
        userRepository.save(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "User " + user.getFullName() + " reactivated successfully.");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/transactions")
    public ResponseEntity<?> getAllTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        org.springframework.data.domain.Pageable pageable =
                org.springframework.data.domain.PageRequest.of(page, Math.min(size, 200),
                        org.springframework.data.domain.Sort.by("createdAt").descending());
        return ResponseEntity.ok(transactionRepository.findAll(pageable));
    }

    @GetMapping("/dashboard-stats")
    public ResponseEntity<?> getDashboardStats() {
        long totalUsers = userRepository.count();

        List<Account> accounts = accountRepository.findAll();
        BigDecimal totalDeposits = accounts.stream()
                .map(Account::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);
        long todayTransactionsCount = transactionRepository.countByCreatedAtBetween(startOfDay, endOfDay);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalDeposits", totalDeposits);
        stats.put("todayTransactionsCount", todayTransactionsCount);
        stats.put("totalAccountsCount", accounts.size());

        return ResponseEntity.ok(stats);
    }

    // Account Management Endpoints
    @GetMapping("/accounts")
    public ResponseEntity<?> getAllAccounts() {
        List<Account> accounts = accountRepository.findAll();
        return ResponseEntity.ok(accounts);
    }

    @GetMapping("/accounts/{accountNumber}")
    public ResponseEntity<?> getAccountByNumber(@PathVariable String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new CustomException("Account not found.", HttpStatus.NOT_FOUND));
        return ResponseEntity.ok(account);
    }

    @PostMapping("/accounts/{userId}/create")
    public ResponseEntity<?> createAccount(@PathVariable Long userId, @RequestBody AccountRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("User not found.", HttpStatus.NOT_FOUND));

        Account account = new Account();
        account.setAccountNumber(generateAccountNumber());
        account.setAccountType(request.getAccountType());
        account.setBalance(request.getInitialBalance());
        account.setUser(user);
        account.setIsActive(true);
        account.setCreatedAt(LocalDateTime.now());

        Account savedAccount = accountRepository.save(account);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Account created successfully.");
        response.put("account", savedAccount);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/accounts/{accountNumber}/freeze")
    public ResponseEntity<?> freezeAccount(@PathVariable String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new CustomException("Account not found.", HttpStatus.NOT_FOUND));

        account.setIsActive(false);
        accountRepository.save(account);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Account " + accountNumber + " frozen successfully.");

        return ResponseEntity.ok(response);
    }

    @PutMapping("/accounts/{accountNumber}/unfreeze")
    public ResponseEntity<?> unfreezeAccount(@PathVariable String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new CustomException("Account not found.", HttpStatus.NOT_FOUND));

        account.setIsActive(true);
        accountRepository.save(account);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Account " + accountNumber + " unfrozen successfully.");

        return ResponseEntity.ok(response);
    }

    @PutMapping("/accounts/{accountNumber}/balance")
    public ResponseEntity<?> updateAccountBalance(@PathVariable String accountNumber, @RequestBody BalanceUpdateRequest request) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new CustomException("Account not found.", HttpStatus.NOT_FOUND));

        account.setBalance(request.getNewBalance());
        accountRepository.save(account);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Account balance updated successfully.");
        response.put("newBalance", account.getBalance());

        return ResponseEntity.ok(response);
    }

    // Transaction Management Endpoints
    @GetMapping("/transactions/{transactionId}")
    public ResponseEntity<?> getTransactionById(@PathVariable String transactionId) {
        Transaction transaction = transactionRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new CustomException("Transaction not found.", HttpStatus.NOT_FOUND));
        return ResponseEntity.ok(transaction);
    }

    @PutMapping("/transactions/{transactionId}/reverse")
    public ResponseEntity<?> reverseTransaction(@PathVariable String transactionId) {
        Transaction transaction = transactionRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new CustomException("Transaction not found.", HttpStatus.NOT_FOUND));

        if (!"SUCCESS".equals(transaction.getStatus())) {
            throw new CustomException("Only successful transactions can be reversed.", HttpStatus.BAD_REQUEST);
        }

        transaction.setStatus("REVERSED");
        transactionRepository.save(transaction);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Transaction reversed successfully.");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/transactions/suspicious")
    public ResponseEntity<?> getSuspiciousTransactions() {
        // Find transactions above a certain threshold or with unusual patterns
        List<Transaction> allTransactions = transactionRepository.findAll();
        List<Transaction> suspicious = allTransactions.stream()
                .filter(t -> t.getAmount().compareTo(new BigDecimal("100000")) > 0)
                .toList();

        return ResponseEntity.ok(suspicious);
    }

    // User Management Enhancement
    @GetMapping("/users/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("User not found.", HttpStatus.NOT_FOUND));
        return ResponseEntity.ok(userService.toSafeUserResponse(user));
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long userId, @RequestBody RoleUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("User not found.", HttpStatus.NOT_FOUND));

        if ("ADMIN".equals(user.getRole())) {
            throw new CustomException("Cannot modify admin role.", HttpStatus.FORBIDDEN);
        }

        user.setRole(request.getRole());
        userRepository.save(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "User role updated successfully.");

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("User not found.", HttpStatus.NOT_FOUND));

        if ("ADMIN".equals(user.getRole())) {
            throw new CustomException("Cannot delete admin account.", HttpStatus.FORBIDDEN);
        }

        userRepository.delete(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "User deleted successfully.");

        return ResponseEntity.ok(response);
    }

    // Helper method to generate account number
    private String generateAccountNumber() {
        return "NUMS" + System.currentTimeMillis() + (int)(Math.random() * 1000);
    }

    // System Metrics Endpoint
    @GetMapping("/system/metrics")
    public ResponseEntity<?> getSystemMetrics() {
        long totalUsers = userRepository.count();
        long totalAccounts = accountRepository.count();
        long totalTransactions = transactionRepository.count();
        long totalLoans = loanRepository.count();

        // Calculate today's activity
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);
        long todayTransactions = transactionRepository.countByCreatedAtBetween(startOfDay, endOfDay);

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalUsers", totalUsers);
        metrics.put("totalAccounts", totalAccounts);
        metrics.put("totalTransactions", totalTransactions);
        metrics.put("totalLoans", totalLoans);
        metrics.put("todayTransactions", todayTransactions);
        metrics.put("systemStatus", "OPERATIONAL");
        metrics.put("timestamp", LocalDateTime.now());

        return ResponseEntity.ok(metrics);
    }

    // Loan Management Endpoints
    @GetMapping("/loans/all")
    public ResponseEntity<?> getAllLoans() {
        List<Loan> loans = loanRepository.findAll();
        
        // Convert loans to response format
        List<Map<String, Object>> loanResponses = loans.stream()
                .map(loan -> {
                    Map<String, Object> loanData = new HashMap<>();
                    loanData.put("id", loan.getId());
                    loanData.put("loanId", "LN" + String.format("%06d", loan.getId()));
                    loanData.put("type", loan.getLoanType());
                    loanData.put("amount", loan.getPrincipalAmount());
                    loanData.put("tenureMonths", loan.getTenureMonths());
                    loanData.put("interestRate", loan.getInterestRate());
                    loanData.put("emi", loan.getEmiAmount());
                    loanData.put("status", loan.getStatus());
                    loanData.put("createdAt", loan.getCreatedAt());
                    loanData.put("user", Map.of(
                        "fullName", loan.getUser() != null ? loan.getUser().getFullName() : "N/A",
                        "id", loan.getUser() != null ? loan.getUser().getId() : null
                    ));
                    return loanData;
                })
                .toList();
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Loan data retrieved successfully");
        response.put("loans", loanResponses);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/loans/{loanId}/approve")
    public ResponseEntity<?> approveLoan(@PathVariable Long loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new CustomException("Loan not found.", HttpStatus.NOT_FOUND));

        loan.setStatus("APPROVED");
        loanRepository.save(loan);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Loan " + loanId + " approved successfully.");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/loans/{loanId}/reject")
    public ResponseEntity<?> rejectLoan(@PathVariable Long loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new CustomException("Loan not found.", HttpStatus.NOT_FOUND));

        loan.setStatus("REJECTED");
        loanRepository.save(loan);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Loan " + loanId + " rejected successfully.");
        return ResponseEntity.ok(response);
    }

    // System Configuration Endpoints
    @GetMapping("/config/interest-rates")
    public ResponseEntity<?> getInterestRates() {
        Map<String, Object> rates = new HashMap<>();
        rates.put("savingsRate", 4.0);
        rates.put("currentRate", 3.5);
        rates.put("loanRate", 10.5);
        rates.put("fixedDepositRate", 6.5);
        return ResponseEntity.ok(rates);
    }

    @PutMapping("/config/interest-rates")
    public ResponseEntity<?> updateInterestRates(@RequestBody Map<String, Double> rates) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Interest rates updated successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/config/fees")
    public ResponseEntity<?> getFees() {
        Map<String, Object> fees = new HashMap<>();
        fees.put("transactionFee", 5.0);
        fees.put("accountMaintenanceFee", 100.0);
        fees.put("minimumBalance", 1000.0);
        return ResponseEntity.ok(fees);
    }

    @PutMapping("/config/fees")
    public ResponseEntity<?> updateFees(@RequestBody Map<String, Double> fees) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Fees updated successfully");
        return ResponseEntity.ok(response);
    }

    // Report Generation Endpoints
    @GetMapping("/reports/daily")
    public ResponseEntity<?> getDailyReport(@RequestParam String date) {
        try {
            LocalDate reportDate = LocalDate.parse(date);
            LocalDateTime startOfDay = LocalDateTime.of(reportDate, LocalTime.MIN);
            LocalDateTime endOfDay = LocalDateTime.of(reportDate, LocalTime.MAX);

            List<Transaction> dayTransactions = transactionRepository.findByCreatedAtBetween(startOfDay, endOfDay);
            
            long totalTransactions = dayTransactions.size();
            BigDecimal totalAmount = dayTransactions.stream()
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            long successfulTransactions = dayTransactions.stream()
                    .filter(t -> "SUCCESS".equals(t.getStatus()))
                    .count();
            
            double successRate = totalTransactions > 0 
                    ? (successfulTransactions * 100.0 / totalTransactions) 
                    : 100.0;

            Map<String, Object> report = new HashMap<>();
            report.put("date", date);
            report.put("totalTransactions", totalTransactions);
            report.put("totalAmount", totalAmount);
            report.put("successRate", Math.round(successRate * 100.0) / 100.0);
            report.put("newAccounts", 0); // Would need account creation tracking

            return ResponseEntity.ok(report);
        } catch (Exception e) {
            throw new CustomException("Invalid date format. Use YYYY-MM-DD", HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/reports/monthly")
    public ResponseEntity<?> getMonthlyReport(@RequestParam String month) {
        try {
            // Parse month (format: YYYY-MM)
            String[] parts = month.split("-");
            int year = Integer.parseInt(parts[0]);
            int monthNum = Integer.parseInt(parts[1]);
            
            LocalDate startOfMonth = LocalDate.of(year, monthNum, 1);
            LocalDate endOfMonth = startOfMonth.withDayOfMonth(startOfMonth.lengthOfMonth());
            
            LocalDateTime startDateTime = LocalDateTime.of(startOfMonth, LocalTime.MIN);
            LocalDateTime endDateTime = LocalDateTime.of(endOfMonth, LocalTime.MAX);

            List<Transaction> monthTransactions = transactionRepository.findByCreatedAtBetween(startDateTime, endDateTime);
            
            long totalTransactions = monthTransactions.size();
            BigDecimal totalAmount = monthTransactions.stream()
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            long successfulTransactions = monthTransactions.stream()
                    .filter(t -> "SUCCESS".equals(t.getStatus()))
                    .count();
            
            double successRate = totalTransactions > 0 
                    ? (successfulTransactions * 100.0 / totalTransactions) 
                    : 100.0;

            // Count new accounts created in this month
            long newAccounts = accountRepository.countByCreatedAtBetween(startDateTime, endDateTime);

            Map<String, Object> report = new HashMap<>();
            report.put("month", month);
            report.put("totalTransactions", totalTransactions);
            report.put("totalAmount", totalAmount);
            report.put("successRate", Math.round(successRate * 100.0) / 100.0);
            report.put("newAccounts", newAccounts);

            return ResponseEntity.ok(report);
        } catch (Exception e) {
            throw new CustomException("Invalid month format. Use YYYY-MM", HttpStatus.BAD_REQUEST);
        }
    }

    // Audit Log Endpoints
    @GetMapping("/audit-logs")
    public ResponseEntity<?> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        // Get recent transactions as audit logs
        List<Transaction> allTransactions = transactionRepository.findAll();
        
        // Sort by creation date descending
        allTransactions.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        
        // Apply pagination
        int start = page * size;
        int end = Math.min(start + size, allTransactions.size());
        
        List<Transaction> paginatedTransactions = start < allTransactions.size() 
                ? allTransactions.subList(start, end) 
                : List.of();
        
        // Convert transactions to audit log format
        List<Map<String, Object>> auditLogs = paginatedTransactions.stream()
                .map(txn -> {
                    Map<String, Object> log = new HashMap<>();
                    log.put("timestamp", txn.getCreatedAt());
                    log.put("user", txn.getFromAccount() != null ? txn.getFromAccount().getAccountNumber() : "SYSTEM");
                    log.put("action", "TRANSACTION");
                    log.put("details", String.format("%s transaction of %s from %s to %s", 
                            txn.getStatus(), 
                            txn.getAmount(),
                            txn.getFromAccount() != null ? txn.getFromAccount().getAccountNumber() : "SYSTEM",
                            txn.getToAccountNumber()));
                    log.put("ipAddress", "N/A");
                    log.put("status", txn.getStatus());
                    log.put("isToday", txn.getCreatedAt().toLocalDate().equals(LocalDate.now()));
                    log.put("isCritical", txn.getAmount().compareTo(new BigDecimal("100000")) > 0);
                    log.put("isAdmin", true);
                    return log;
                })
                .toList();
        
        Map<String, Object> response = new HashMap<>();
        response.put("logs", auditLogs);
        response.put("total", allTransactions.size());
        
        return ResponseEntity.ok(response);
    }

    // Request DTOs
    public static class AccountRequest {
        private String accountType;
        private BigDecimal initialBalance;

        public String getAccountType() { return accountType; }
        public void setAccountType(String accountType) { this.accountType = accountType; }
        public BigDecimal getInitialBalance() { return initialBalance; }
        public void setInitialBalance(BigDecimal initialBalance) { this.initialBalance = initialBalance; }
    }

    public static class BalanceUpdateRequest {
        private BigDecimal newBalance;

        public BigDecimal getNewBalance() { return newBalance; }
        public void setNewBalance(BigDecimal newBalance) { this.newBalance = newBalance; }
    }

    public static class RoleUpdateRequest {
        private String role;

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }

    public static class AdminLoginRequest {
        @NotBlank(message = "Admin email is required.")
        @Email(message = "Invalid email format.")
        private String email;

        @NotBlank(message = "Admin password is required.")
        private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
}
