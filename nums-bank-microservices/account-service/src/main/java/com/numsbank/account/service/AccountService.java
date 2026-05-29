package com.numsbank.account.service;

import com.numsbank.account.entity.Account;
import com.numsbank.account.entity.User;
import com.numsbank.account.exception.CustomException;
import com.numsbank.account.repository.AccountRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Random;

@Service
public class AccountService {

    private final AccountRepository accountRepository;

    public AccountService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    @Transactional
    public Account createAccount(User user, String accountType, BigDecimal initialDeposit) {
        if (initialDeposit == null || initialDeposit.compareTo(BigDecimal.ZERO) < 0) {
            throw new CustomException("Initial deposit must be greater than or equal to 0.", HttpStatus.BAD_REQUEST);
        }

        if (!"SAVINGS".equalsIgnoreCase(accountType) && !"CURRENT".equalsIgnoreCase(accountType)) {
            throw new CustomException("Invalid account type. Must be SAVINGS or CURRENT.", HttpStatus.BAD_REQUEST);
        }

        String accountNumber = generateUniqueAccountNumber(accountType);

        Account account = new Account();
        account.setUser(user);
        account.setAccountNumber(accountNumber);
        account.setAccountType(accountType.toUpperCase());
        account.setBalance(initialDeposit);
        account.setIsActive(true);

        return accountRepository.save(account);
    }

    public List<Account> getUserAccounts(User user) {
        return accountRepository.findByUser(user);
    }

    public Account getAccountById(Long accountId, User user) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new CustomException("Account not found.", HttpStatus.NOT_FOUND));

        if (!account.getUser().getId().equals(user.getId()) && !"ADMIN".equals(user.getRole())) {
            throw new CustomException("Access denied. You do not own this account.", HttpStatus.FORBIDDEN);
        }

        return account;
    }

    public Account getAccountByNumber(String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new CustomException("Account not found with number: " + accountNumber, HttpStatus.NOT_FOUND));
    }

    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    private String generateUniqueAccountNumber(String type) {
        Random random = new Random();
        String prefix = "SAVINGS".equalsIgnoreCase(type) ? "SAV" : "CUR";
        String accountNumber;
        
        do {
            long suffix = 10000000L + random.nextInt(90000000);
            accountNumber = prefix + suffix;
        } while (accountRepository.findByAccountNumber(accountNumber).isPresent());

        return accountNumber;
    }
}
