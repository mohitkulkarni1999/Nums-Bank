package com.numsbank.account.controller;

import com.numsbank.account.entity.Account;
import com.numsbank.account.entity.User;
import com.numsbank.account.service.AccountService;
import com.numsbank.account.service.EmailService;
import com.numsbank.account.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(origins = "https://nums-bank.vercel.app", allowCredentials = "true")
public class AccountController {

    private final AccountService accountService;
    private final UserService userService;
    private final EmailService emailService;

    public AccountController(AccountService accountService, UserService userService, EmailService emailService) {
        this.accountService = accountService;
        this.userService = userService;
        this.emailService = emailService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createAccount(@RequestBody Map<String, Object> body) {
        User user = userService.getCurrentUser();
        String type = (String) body.get("type");
        BigDecimal initialDeposit = new BigDecimal(body.get("initialDeposit").toString());

        Account account = accountService.createAccount(user, type, initialDeposit);

        // Send account creation email
        try {
            emailService.sendAccountCreationEmail(
                user.getEmail(),
                account.getAccountNumber(),
                account.getAccountType(),
                initialDeposit.toString()
            );
        } catch (Exception e) {
            // Log error but don't fail account creation
            System.err.println("Failed to send account creation email: " + e.getMessage());
        }

        return ResponseEntity.ok(account);
    }

    @GetMapping("/balance/{accountId}")
    public ResponseEntity<?> getBalance(@PathVariable Long accountId) {
        User user = userService.getCurrentUser();
        Account account = accountService.getAccountById(accountId, user);

        Map<String, Object> response = new HashMap<>();
        response.put("accountId", account.getId());
        response.put("accountNumber", account.getAccountNumber());
        response.put("balance", account.getBalance());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getAccountSummary() {
        User user = userService.getCurrentUser();
        List<Account> accounts = accountService.getUserAccounts(user);
        
        BigDecimal totalBalance = accounts.stream()
                .map(Account::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> response = new HashMap<>();
        response.put("accounts", accounts);
        response.put("totalBalance", totalBalance);
        response.put("userName", user.getFullName());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchAccount(@RequestParam("q") String query) {
        if (query == null || query.trim().length() < 2) {
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
        User currentUser = userService.getCurrentUser();

        List<Account> all = accountService.getAllAccounts();
        List<Map<String, Object>> results = all.stream()
            .filter(acc -> acc.getUser() != null
                && !acc.getUser().getId().equals(currentUser.getId())
                && acc.getIsActive()
                && acc.getUser().getIsActive()
                && acc.getUser().getIsApproved()
                && acc.getUser().getFullName().toLowerCase().contains(query.toLowerCase().trim()))
            .map(acc -> {
                Map<String, Object> r = new HashMap<>();
                r.put("accountNumber", acc.getAccountNumber());
                r.put("accountType", acc.getAccountType());
                r.put("beneficiaryName", acc.getUser().getFullName());
                r.put("bankName", "NUMS Bank");
                r.put("ifscCode", "NUMS0000001");
                return r;
            })
            .toList();

        return ResponseEntity.ok(results);
    }
}
