package com.numsbank.transaction.controller;

import com.numsbank.transaction.entity.Beneficiary;
import com.numsbank.transaction.entity.Transaction;
import com.numsbank.transaction.entity.User;
import com.numsbank.transaction.service.EmailService;
import com.numsbank.transaction.service.TransactionService;
import com.numsbank.transaction.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "https://nums-bank.vercel.app", allowCredentials = "true")
public class TransactionController {

    private final TransactionService transactionService;
    private final UserService userService;
    private final EmailService emailService;

    public TransactionController(TransactionService transactionService, UserService userService, EmailService emailService) {
        this.transactionService = transactionService;
        this.userService = userService;
        this.emailService = emailService;
    }

    @PostMapping("/send")
    public ResponseEntity<?> sendMoney(@RequestBody Map<String, Object> body) {
        User user = userService.getCurrentUser();
        Long fromAccountId = Long.valueOf(body.get("fromAccountId").toString());
        String toAccountNumber = (String) body.get("toAccountNumber");
        BigDecimal amount = new BigDecimal(body.get("amount").toString());
        String remarks = (String) body.get("remarks");
        String transactionType = (String) body.get("transactionType");
        String transactionPin = (String) body.get("transactionPin");

        Transaction transaction = transactionService.sendMoney(
                user, fromAccountId, toAccountNumber, amount, remarks, transactionType, transactionPin
        );

        // Send transaction alert email
        try {
            emailService.sendTransactionAlert(
                user.getEmail(),
                transactionType,
                amount.toString(),
                transaction.getFromAccount().getAccountNumber(),
                transaction.getFromAccount().getBalance().toString()
            );
        } catch (Exception e) {
            // Log error but don't fail transaction
            System.err.println("Failed to send transaction alert email: " + e.getMessage());
        }

        return ResponseEntity.ok(transaction);
    }

    @GetMapping("/history")
    public ResponseEntity<?> getTransactionHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false, defaultValue = "ALL") String type,
            @RequestParam(required = false, defaultValue = "ALL") String status,
            @RequestParam(required = false) String accountNumber) {
        
        User user = userService.getCurrentUser();
        Page<Transaction> history = transactionService.getTransactionHistory(
                user, page, size, fromDate, toDate, type, status, accountNumber
        );

        return ResponseEntity.ok(history);
    }

    @GetMapping("/{transactionId}")
    public ResponseEntity<?> getTransactionById(@PathVariable String transactionId) {
        User user = userService.getCurrentUser();
        Transaction transaction = transactionService.getTransactionById(transactionId, user);
        return ResponseEntity.ok(transaction);
    }

    @PostMapping("/beneficiary/add")
    public ResponseEntity<?> addBeneficiary(@RequestBody Map<String, String> body) {
        User user = userService.getCurrentUser();
        String name = body.get("name");
        String accountNumber = body.get("accountNumber");
        String ifsc = body.get("ifsc");
        String bankName = body.get("bankName");

        Beneficiary beneficiary = transactionService.addBeneficiary(user, name, accountNumber, ifsc, bankName);
        return ResponseEntity.ok(beneficiary);
    }

    @GetMapping("/beneficiaries")
    public ResponseEntity<?> getBeneficiaries() {
        User user = userService.getCurrentUser();
        List<Beneficiary> beneficiaries = transactionService.getBeneficiaries(user);
        return ResponseEntity.ok(beneficiaries);
    }

    @DeleteMapping("/beneficiary/{beneficiaryId}")
    public ResponseEntity<?> removeBeneficiary(@PathVariable Long beneficiaryId) {
        User user = userService.getCurrentUser();
        transactionService.removeBeneficiary(user, beneficiaryId);
        return ResponseEntity.ok(Map.of("message", "Beneficiary removed successfully"));
    }

    @PostMapping("/deposit")
    public ResponseEntity<?> depositCash(@RequestBody Map<String, Object> body) {
        User user = userService.getCurrentUser();
        String accountNumber = (String) body.get("accountNumber");
        BigDecimal amount = new BigDecimal(body.get("amount").toString());

        Transaction transaction = transactionService.depositCash(user, accountNumber, amount);

        // Send transaction alert email
        try {
            emailService.sendTransactionAlert(
                user.getEmail(),
                "DEPOSIT",
                amount.toString(),
                accountNumber,
                transaction.getFromAccount().getBalance().toString()
            );
        } catch (Exception e) {
            // Log error but don't fail transaction
            System.err.println("Failed to send deposit alert email: " + e.getMessage());
        }

        return ResponseEntity.ok(transaction);
    }

    @PostMapping("/pin/setup")
    public ResponseEntity<?> setupTransactionPin(@RequestBody Map<String, String> body) {
        User user = userService.getCurrentUser();
        String pin = body.get("pin");
        transactionService.setupTransactionPin(user, pin);
        return ResponseEntity.ok(Map.of("message", "Transaction PIN set up successfully"));
    }

    @PostMapping("/pin/reset")
    public ResponseEntity<?> resetTransactionPin(@RequestBody Map<String, String> body) {
        User user = userService.getCurrentUser();
        String oldPin = body.get("oldPin");
        String newPin = body.get("newPin");
        transactionService.resetTransactionPin(user, oldPin, newPin);
        return ResponseEntity.ok(Map.of("message", "Transaction PIN reset successfully"));
    }

    @PostMapping("/loan-payoff")
    public ResponseEntity<?> payoffLoan(@RequestBody Map<String, Object> body, @RequestHeader("Authorization") String authHeader) {
        User user = userService.getCurrentUser();
        Long loanId = Long.valueOf(body.get("loanId").toString());
        Long accountId = body.get("accountId") != null ? Long.valueOf(body.get("accountId").toString()) : null;

        Map<String, Object> result = transactionService.payoffLoan(user, loanId, accountId, authHeader);
        return ResponseEntity.ok(result);
    }
}
