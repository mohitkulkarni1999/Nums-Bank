package com.numsbank.transaction.service;

import com.numsbank.transaction.entity.*;
import com.numsbank.transaction.exception.CustomException;
import com.numsbank.transaction.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final BeneficiaryRepository beneficiaryRepository;
    private final TransactionPinRepository pinRepository;
    private final PasswordEncoder passwordEncoder;

    public TransactionService(
            TransactionRepository transactionRepository,
            AccountRepository accountRepository,
            BeneficiaryRepository beneficiaryRepository,
            TransactionPinRepository pinRepository,
            PasswordEncoder passwordEncoder) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
        this.beneficiaryRepository = beneficiaryRepository;
        this.pinRepository = pinRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public Transaction sendMoney(User user, Long fromAccountId, String toAccountNumber, BigDecimal amount,
                                 String remarks, String transactionType, String transactionPin) {
        
        TransactionPin pinDetails = pinRepository.findById(user.getId())
                .orElseThrow(() -> new CustomException("Transaction PIN not setup for this user.", HttpStatus.BAD_REQUEST));

        if (pinDetails.getIsLocked()) {
            throw new CustomException("Transaction PIN is locked due to too many failed attempts. Please reset.", HttpStatus.FORBIDDEN);
        }

        if (!passwordEncoder.matches(transactionPin, pinDetails.getPinHash())) {
            pinDetails.setFailedAttempts(pinDetails.getFailedAttempts() + 1);
            if (pinDetails.getFailedAttempts() >= 3) {
                pinDetails.setIsLocked(true);
                pinRepository.save(pinDetails);
                throw new CustomException("Incorrect PIN. Account PIN has been locked after 3 failed attempts.", HttpStatus.FORBIDDEN);
            }
            pinRepository.save(pinDetails);
            throw new CustomException("Incorrect transaction PIN. Attempts remaining: " + (3 - pinDetails.getFailedAttempts()), HttpStatus.BAD_REQUEST);
        }

        pinDetails.setFailedAttempts(0);
        pinRepository.save(pinDetails);

        Account fromAccount = accountRepository.findById(fromAccountId)
                .orElseThrow(() -> new CustomException("Source account not found.", HttpStatus.NOT_FOUND));

        if (!fromAccount.getUser().getId().equals(user.getId())) {
            throw new CustomException("Access Denied. You do not own the source account.", HttpStatus.FORBIDDEN);
        }

        if (!fromAccount.getIsActive()) {
            throw new CustomException("Source account is inactive.", HttpStatus.BAD_REQUEST);
        }

        if (amount == null || amount.compareTo(BigDecimal.ONE) < 0 || amount.compareTo(new BigDecimal("1000000")) > 0) {
            throw new CustomException("Transfer amount must be between ₹1.00 and ₹10,00,000.00.", HttpStatus.BAD_REQUEST);
        }

        if (fromAccount.getBalance().compareTo(amount) < 0) {
            throw new CustomException("Insufficient funds. Available balance: ₹" + fromAccount.getBalance(), HttpStatus.BAD_REQUEST);
        }

        if ("RTGS".equalsIgnoreCase(transactionType) && amount.compareTo(new BigDecimal("200000")) < 0) {
            throw new CustomException("RTGS transactions require a minimum transfer of ₹2,00,000.00.", HttpStatus.BAD_REQUEST);
        }

        BigDecimal maxPerTx = "RTGS".equalsIgnoreCase(transactionType)
                ? new BigDecimal("1000000")
                : new BigDecimal("50000");
        BigDecimal maxDaily = new BigDecimal("1000000");

        if (amount.compareTo(maxPerTx) > 0) {
            throw new CustomException("Transaction amount exceeds the per-transaction limit of ₹" + maxPerTx, HttpStatus.BAD_REQUEST);
        }

        BigDecimal totalSentToday = calculateTotalSentToday(user);
        if (totalSentToday.add(amount).compareTo(maxDaily) > 0) {
            throw new CustomException("Transaction exceeds the daily transfer limit of ₹" + maxDaily + ". Sent today: ₹" + totalSentToday, HttpStatus.BAD_REQUEST);
        }

        // Check if recipient account exists in NUMS Bank system
        Optional<Account> toAccountOpt = accountRepository.findByAccountNumber(toAccountNumber);
        boolean isInternalTransfer = toAccountOpt.isPresent();

        if (isInternalTransfer) {
            Account toAccount = toAccountOpt.get();
            
            // Validate internal account is active
            if (!toAccount.getIsActive()) {
                throw new CustomException("Recipient account is currently inactive or frozen. Cannot transfer funds to this account.", HttpStatus.BAD_REQUEST);
            }

            // Prevent self-transfer
            if (fromAccount.getId().equals(toAccount.getId())) {
                throw new CustomException("Cannot transfer funds to the same account.", HttpStatus.BAD_REQUEST);
            }
        }

        String transactionId = "TXN" + System.currentTimeMillis() + String.format("%04d", (int)(Math.random() * 9000 + 1000));

        fromAccount.setBalance(fromAccount.getBalance().subtract(amount));
        accountRepository.save(fromAccount);

        if (isInternalTransfer) {
            Account toAccount = toAccountOpt.get();
            toAccount.setBalance(toAccount.getBalance().add(amount));
            accountRepository.save(toAccount);
        } else {
            // External transfer - will be settled via external banking network
            System.out.println("[NUMS BANK] External transfer of ₹" + amount + " to account: " + toAccountNumber);
        }

        Transaction transaction = new Transaction();
        transaction.setTransactionId(transactionId);
        transaction.setFromAccount(fromAccount);
        transaction.setToAccountNumber(toAccountNumber);
        transaction.setAmount(amount);
        transaction.setRemarks(remarks);
        transaction.setStatus("SUCCESS");
        transaction.setTransactionType(transactionType.toUpperCase());
        transaction.setCreatedAt(LocalDateTime.now());

        return transactionRepository.save(transaction);
    }

    private BigDecimal calculateTotalSentToday(User user) {
        List<Account> accounts = accountRepository.findByUser(user);
        if (accounts.isEmpty()) return BigDecimal.ZERO;

        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);

        List<String> accountNumbers = accounts.stream().map(Account::getAccountNumber).collect(Collectors.toList());

        List<Transaction> todayTxns = transactionRepository.findUserTransactionsByDate(
                accounts,
                accountNumbers,
                startOfDay,
                endOfDay
        );

        Set<Long> accountIds = accounts.stream().map(Account::getId).collect(Collectors.toSet());

        return todayTxns.stream()
                .filter(t -> t.getFromAccount() != null
                        && accountIds.contains(t.getFromAccount().getId())
                        && "SUCCESS".equalsIgnoreCase(t.getStatus()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public Page<Transaction> getTransactionHistory(User user, int page, int size, String fromDate, String toDate, String type, String status, String accountNumber) {
        List<Account> accounts = accountRepository.findByUser(user);
        if (accounts.isEmpty()) {
            return new PageImpl<>(new ArrayList<>());
        }

        if (accountNumber != null && !accountNumber.trim().isEmpty()) {
            accounts = accounts.stream()
                    .filter(a -> a.getAccountNumber().equals(accountNumber))
                    .collect(Collectors.toList());
            if (accounts.isEmpty()) {
                return new PageImpl<>(new ArrayList<>());
            }
        }

        List<String> accountNumbers = accounts.stream().map(Account::getAccountNumber).collect(Collectors.toList());

        LocalDateTime start = LocalDateTime.of(1970, 1, 1, 0, 0, 0);
        LocalDateTime end = LocalDateTime.of(2099, 12, 31, 23, 59, 59);
        DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE;

        if (fromDate != null && !fromDate.trim().isEmpty()) {
            start = LocalDate.parse(fromDate, formatter).atStartOfDay();
        }
        if (toDate != null && !toDate.trim().isEmpty()) {
            end = LocalDate.parse(toDate, formatter).atTime(LocalTime.MAX);
        }

        Pageable pageable = PageRequest.of(page, size);
        return transactionRepository.findFilteredTransactions(
                accounts, 
                accountNumbers, 
                start, 
                end, 
                status != null ? status : "ALL", 
                type != null ? type : "ALL", 
                pageable
        );
    }

    public Transaction getTransactionById(String transactionId, User user) {
        Transaction transaction = transactionRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new CustomException("Transaction details not found.", HttpStatus.NOT_FOUND));

        boolean ownsSender = transaction.getFromAccount() != null && transaction.getFromAccount().getUser().getId().equals(user.getId());
        
        List<Account> userAccounts = accountRepository.findByUser(user);
        boolean ownsReceiver = userAccounts.stream().anyMatch(a -> a.getAccountNumber().equals(transaction.getToAccountNumber()));

        if (!ownsSender && !ownsReceiver && !"ADMIN".equals(user.getRole())) {
            throw new CustomException("Access Denied to transaction details.", HttpStatus.FORBIDDEN);
        }

        return transaction;
    }

    @Transactional
    public Beneficiary addBeneficiary(User user, String name, String accountNumber, String ifsc, String bankName) {
        if (name == null || name.isEmpty() || accountNumber == null || accountNumber.isEmpty() || ifsc == null || ifsc.isEmpty()) {
            throw new CustomException("Invalid Beneficiary data. All fields are required.", HttpStatus.BAD_REQUEST);
        }

        Optional<Beneficiary> existing = beneficiaryRepository.findByUserAndAccountNumber(user, accountNumber);
        if (existing.isPresent()) {
            Beneficiary b = existing.get();
            if (b.getIsActive()) {
                throw new CustomException("Beneficiary already added.", HttpStatus.BAD_REQUEST);
            } else {
                b.setIsActive(true);
                return beneficiaryRepository.save(b);
            }
        }

        Beneficiary beneficiary = new Beneficiary(user, name, accountNumber, ifsc, bankName);
        return beneficiaryRepository.save(beneficiary);
    }

    public List<Beneficiary> getBeneficiaries(User user) {
        return beneficiaryRepository.findByUserAndIsActiveTrue(user);
    }

    @Transactional
    public void removeBeneficiary(User user, Long beneficiaryId) {
        Beneficiary beneficiary = beneficiaryRepository.findById(beneficiaryId)
                .orElseThrow(() -> new CustomException("Beneficiary not found.", HttpStatus.NOT_FOUND));

        if (!beneficiary.getUser().getId().equals(user.getId())) {
            throw new CustomException("Access Denied. You do not own this beneficiary.", HttpStatus.FORBIDDEN);
        }

        beneficiary.setIsActive(false);
        beneficiaryRepository.save(beneficiary);
    }

    @Transactional
    public void setupTransactionPin(User user, String pin) {
        if (pin == null || pin.length() != 6 || !pin.matches("\\d{6}")) {
            throw new CustomException("Transaction PIN must be exactly 6 digits.", HttpStatus.BAD_REQUEST);
        }

        Optional<com.numsbank.transaction.entity.TransactionPin> existingPin = pinRepository.findById(user.getId());
        if (existingPin.isPresent()) {
            throw new CustomException("Transaction PIN is already set up. Use reset functionality to change it.", HttpStatus.BAD_REQUEST);
        }

        com.numsbank.transaction.entity.TransactionPin transactionPin = new com.numsbank.transaction.entity.TransactionPin();
        transactionPin.setUserId(user.getId());
        transactionPin.setPinHash(passwordEncoder.encode(pin));
        transactionPin.setFailedAttempts(0);
        transactionPin.setIsLocked(false);
        pinRepository.save(transactionPin);
    }

    @Transactional
    public void resetTransactionPin(User user, String oldPin, String newPin) {
        if (newPin == null || newPin.length() != 6 || !newPin.matches("\\d{6}")) {
            throw new CustomException("New Transaction PIN must be exactly 6 digits.", HttpStatus.BAD_REQUEST);
        }

        com.numsbank.transaction.entity.TransactionPin pinDetails = pinRepository.findById(user.getId())
                .orElseThrow(() -> new CustomException("Transaction PIN not setup for this user.", HttpStatus.BAD_REQUEST));

        if (pinDetails.getIsLocked()) {
            throw new CustomException("Transaction PIN is locked. Please contact support.", HttpStatus.FORBIDDEN);
        }

        if (!passwordEncoder.matches(oldPin, pinDetails.getPinHash())) {
            pinDetails.setFailedAttempts(pinDetails.getFailedAttempts() + 1);
            if (pinDetails.getFailedAttempts() >= 3) {
                pinDetails.setIsLocked(true);
                pinRepository.save(pinDetails);
                throw new CustomException("Incorrect PIN. Account PIN has been locked after 3 failed attempts.", HttpStatus.FORBIDDEN);
            }
            pinRepository.save(pinDetails);
            throw new CustomException("Incorrect current PIN. Attempts remaining: " + (3 - pinDetails.getFailedAttempts()), HttpStatus.BAD_REQUEST);
        }

        pinDetails.setPinHash(passwordEncoder.encode(newPin));
        pinDetails.setFailedAttempts(0);
        pinRepository.save(pinDetails);
    }

    @Transactional
    public Transaction depositCash(User user, String accountNumber, BigDecimal amount) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new CustomException("Account not found with number: " + accountNumber, HttpStatus.NOT_FOUND));

        if (!account.getUser().getId().equals(user.getId())) {
            throw new CustomException("Access Denied. You do not own this account.", HttpStatus.FORBIDDEN);
        }

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new CustomException("Deposit amount must be greater than zero.", HttpStatus.BAD_REQUEST);
        }

        account.setBalance(account.getBalance().add(amount));
        accountRepository.save(account);

        String transactionId = "DEP" + System.currentTimeMillis() + (int) (Math.random() * 900 + 100);
        Transaction transaction = new Transaction();
        transaction.setTransactionId(transactionId);
        transaction.setFromAccount(null);
        transaction.setToAccountNumber(accountNumber);
        transaction.setAmount(amount);
        transaction.setRemarks("ATM Cash Deposit");
        transaction.setStatus("SUCCESS");
        transaction.setTransactionType("CREDIT");
        transaction.setCreatedAt(LocalDateTime.now());

        return transactionRepository.save(transaction);
    }

    // Shared RestTemplate — reuse connections instead of creating per-request
    private final org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();

    // Loan-service base URL — use Render URL in production (set via env var LOAN_SERVICE_URL)
    private static final String LOAN_SERVICE_URL =
            System.getenv("LOAN_SERVICE_URL") != null
            ? System.getenv("LOAN_SERVICE_URL")
            : "https://loan-service-gkpk.onrender.com";

    @Transactional
    public Map<String, Object> payoffLoan(User user, Long loanId, Long accountId, String authHeader) {
        // Get user's accounts
        List<Account> accounts = accountRepository.findByUser(user);
        if (accounts.isEmpty()) {
            throw new CustomException("No account found for this user.", HttpStatus.NOT_FOUND);
        }

        Account account;
        if (accountId != null) {
            account = accounts.stream()
                    .filter(a -> a.getId().equals(accountId))
                    .findFirst()
                    .orElseThrow(() -> new CustomException("Account not found or does not belong to user.", HttpStatus.NOT_FOUND));
        } else {
            account = accounts.get(0);
        }

        if (!account.getIsActive()) {
            throw new CustomException("Account is inactive.", HttpStatus.BAD_REQUEST);
        }

        try {
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("Authorization", authHeader);
            headers.set("Content-Type", "application/json");

            // Fetch all loans for this user from loan-service
            String loanServiceUrl = LOAN_SERVICE_URL + "/api/loans/my-loans";
            org.springframework.http.HttpEntity<String> getEntity = new org.springframework.http.HttpEntity<>(headers);
            org.springframework.http.ResponseEntity<List> loanResponse = restTemplate.exchange(
                loanServiceUrl,
                org.springframework.http.HttpMethod.GET,
                getEntity,
                List.class
            );
            List<Map<String, Object>> loans = loanResponse.getBody();

            if (loans == null || loans.isEmpty()) {
                throw new CustomException("No loans found for this user.", HttpStatus.NOT_FOUND);
            }

            // Find the specific loan
            Map<String, Object> loan = loans.stream()
                    .filter(l -> l.get("id") != null && loanId.equals(((Number) l.get("id")).longValue()))
                    .findFirst()
                    .orElseThrow(() -> new CustomException("Loan not found with ID: " + loanId, HttpStatus.NOT_FOUND));

            // Safely extract outstanding amount — supports both field names
            Object amtObj = loan.get("outstandingAmount") != null ? loan.get("outstandingAmount") : loan.get("remainingAmount");
            if (amtObj == null) {
                throw new CustomException("Unable to determine loan outstanding amount.", HttpStatus.INTERNAL_SERVER_ERROR);
            }
            BigDecimal loanAmount = new BigDecimal(amtObj.toString());
            String loanStatus = (String) loan.get("status");

            if (!"ACTIVE".equals(loanStatus)) {
                throw new CustomException("Loan is not active. Current status: " + loanStatus, HttpStatus.BAD_REQUEST);
            }

            if (loanAmount.compareTo(BigDecimal.ZERO) <= 0) {
                throw new CustomException("Loan has already been paid off.", HttpStatus.BAD_REQUEST);
            }

            // Check sufficient balance
            if (account.getBalance().compareTo(loanAmount) < 0) {
                throw new CustomException(
                    "Insufficient account balance. Required: ₹" + loanAmount + ", Available: ₹" + account.getBalance(),
                    HttpStatus.BAD_REQUEST
                );
            }

            // Deduct from account first
            account.setBalance(account.getBalance().subtract(loanAmount));
            accountRepository.save(account);

            // Call loan-service to mark loan as PAID
            try {
                String payOffUrl = LOAN_SERVICE_URL + "/api/loans/pay-off";
                Map<String, Object> payOffRequest = new HashMap<>();
                payOffRequest.put("loanId", loanId);
                org.springframework.http.HttpEntity<Map<String, Object>> payOffEntity =
                    new org.springframework.http.HttpEntity<>(payOffRequest, headers);
                restTemplate.postForEntity(payOffUrl, payOffEntity, Map.class);
            } catch (Exception payOffEx) {
                // If marking paid fails, roll back the balance deduction
                account.setBalance(account.getBalance().add(loanAmount));
                accountRepository.save(account);
                throw new CustomException("Loan payoff failed at loan service: " + payOffEx.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
            }

            // Record transaction
            String transactionId = "LOAN" + System.currentTimeMillis() + (int) (Math.random() * 900 + 100);
            Transaction transaction = new Transaction();
            transaction.setTransactionId(transactionId);
            transaction.setFromAccount(account);
            transaction.setToAccountNumber("LOAN_ACCOUNT");
            transaction.setAmount(loanAmount);
            transaction.setRemarks("Loan Payoff - Loan ID: " + loanId);
            transaction.setStatus("SUCCESS");
            transaction.setTransactionType("DEBIT");
            transaction.setCreatedAt(LocalDateTime.now());
            transactionRepository.save(transaction);

            Map<String, Object> result = new HashMap<>();
            result.put("loanId", loanId);
            result.put("amountPaid", loanAmount);
            result.put("status", "PAID");
            result.put("message", "Loan paid off successfully. ₹" + loanAmount + " deducted from account.");
            result.put("remainingBalance", account.getBalance());
            return result;

        } catch (CustomException e) {
            throw e;
        } catch (Exception e) {
            throw new CustomException("Failed to pay off loan: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
