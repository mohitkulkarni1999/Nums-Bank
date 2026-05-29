package com.numsbank.auth.service;

import com.numsbank.auth.entity.*;
import com.numsbank.auth.exception.CustomException;
import com.numsbank.auth.repository.*;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final TransactionPinRepository pinRepository;
    private final PasswordEncoder passwordEncoder;
    private final AccountRepository accountRepository;
    private final NomineeRepository nomineeRepository;

    private final Map<String, OtpDetails> otpStorage = new ConcurrentHashMap<>();

    public UserService(UserRepository userRepository,
                       TransactionPinRepository pinRepository,
                       @Lazy PasswordEncoder passwordEncoder,
                       AccountRepository accountRepository,
                       NomineeRepository nomineeRepository) {
        this.userRepository = userRepository;
        this.pinRepository = pinRepository;
        this.passwordEncoder = passwordEncoder;
        this.accountRepository = accountRepository;
        this.nomineeRepository = nomineeRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new CustomException("Account is deactivated. Please contact support.", HttpStatus.FORBIDDEN);
        }

        List<org.springframework.security.core.GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + user.getRole()));

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPasswordHash(),
                Boolean.TRUE.equals(user.getIsApproved()),
                true,
                true,
                true,
                authorities
        );
    }

    @Transactional
    public User register(String fullName, String email, String phone, String plainPassword, String panNumber, String aadharNumber) {
        if (userRepository.existsByEmail(email)) {
            throw new CustomException("Email is already registered.", HttpStatus.BAD_REQUEST);
        }
        if (userRepository.existsByPanNumber(panNumber)) {
            throw new CustomException("PAN Number is already registered.", HttpStatus.BAD_REQUEST);
        }

        String maskedAadhar = "XXXX-XXXX-" + aadharNumber.substring(Math.max(0, aadharNumber.length() - 4));

        User user = new User();
        user.setFullName(fullName);
        user.setEmail(email);
        user.setPhone(phone);
        user.setPasswordHash(passwordEncoder.encode(plainPassword));
        user.setPanNumber(panNumber);
        user.setAadharMasked(maskedAadhar);
        user.setIsApproved(true);
        user.setRole("USER");

        User savedUser = userRepository.save(user);

        // Generate a default 6-digit transaction PIN (123456)
        String defaultPinHash = passwordEncoder.encode("123456");
        TransactionPin pin = new TransactionPin(savedUser.getId(), defaultPinHash);
        pinRepository.save(pin);

        // Provision a primary Savings Account with a ₹10,000.00 starting balance
        Account account = new Account();
        account.setUser(savedUser);
        account.setAccountNumber(generateUniqueAccountNumber("SAVINGS"));
        account.setAccountType("SAVINGS");
        account.setBalance(new BigDecimal("10000.00"));
        account.setIsActive(true);
        accountRepository.save(account);

        return savedUser;
    }

    public User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("Current authenticated user context not found.", HttpStatus.UNAUTHORIZED));
    }

    public User getCurrentUserContextByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("User not found with email: " + email, HttpStatus.NOT_FOUND));
    }

    public Map<String, Object> toSafeUserResponse(User user) {
        Map<String, Object> safe = new LinkedHashMap<>();
        safe.put("id", user.getId());
        safe.put("fullName", user.getFullName());
        safe.put("email", user.getEmail());
        safe.put("phone", user.getPhone());
        safe.put("panNumber", user.getPanNumber());
        safe.put("aadharMasked", user.getAadharMasked());
        safe.put("role", user.getRole());
        safe.put("isApproved", user.getIsApproved());
        safe.put("isActive", user.getIsActive());
        safe.put("createdAt", user.getCreatedAt());
        return safe;
    }

    @Transactional
    public User updateProfile(String fullName, String phone) {
        User user = getCurrentUser();
        user.setFullName(fullName);
        user.setPhone(phone);
        return userRepository.save(user);
    }

    @Transactional
    public void changePassword(String currentPassword, String newPassword) {
        User user = getCurrentUser();
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new CustomException("Current password does not match.", HttpStatus.BAD_REQUEST);
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional
    public void changeTransactionPin(String currentPin, String newPin) {
        User user = getCurrentUser();
        TransactionPin pinDetails = pinRepository.findById(user.getId())
                .orElseThrow(() -> new CustomException("Transaction PIN not set up.", HttpStatus.BAD_REQUEST));

        if (pinDetails.getIsLocked()) {
            throw new CustomException("PIN is locked. Please contact support to reset.", HttpStatus.FORBIDDEN);
        }
        if (!passwordEncoder.matches(currentPin, pinDetails.getPinHash())) {
            pinDetails.setFailedAttempts(pinDetails.getFailedAttempts() + 1);
            if (pinDetails.getFailedAttempts() >= 3) {
                pinDetails.setIsLocked(true);
            }
            pinRepository.save(pinDetails);
            throw new CustomException("Current PIN is incorrect.", HttpStatus.BAD_REQUEST);
        }
        if (newPin == null || newPin.length() != 6 || !newPin.matches("\\d{6}")) {
            throw new CustomException("New PIN must be exactly 6 digits.", HttpStatus.BAD_REQUEST);
        }

        pinDetails.setPinHash(passwordEncoder.encode(newPin));
        pinDetails.setFailedAttempts(0);
        pinDetails.setIsLocked(false);
        pinRepository.save(pinDetails);
    }

    @Transactional
    public void unlockTransactionPin(Long userId) {
        TransactionPin pinDetails = pinRepository.findById(userId)
                .orElseThrow(() -> new CustomException("PIN record not found.", HttpStatus.NOT_FOUND));
        pinDetails.setIsLocked(false);
        pinDetails.setFailedAttempts(0);
        pinRepository.save(pinDetails);
    }

    @Transactional
    public Nominee saveNominee(String nomineeName, String relationship, int age, int allocationPercent) {
        User user = getCurrentUser();
        Nominee nominee = nomineeRepository.findFirstByUser(user).orElse(new Nominee());
        nominee.setUser(user);
        nominee.setNomineeName(nomineeName.trim());
        nominee.setRelationship(relationship.trim());
        nominee.setAge(age);
        nominee.setAllocationPercent(allocationPercent);
        return nomineeRepository.save(nominee);
    }

    public Optional<Nominee> getNominee() {
        User user = getCurrentUser();
        return nomineeRepository.findFirstByUser(user);
    }

    public String generateForgotPasswordOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("Email address not found.", HttpStatus.NOT_FOUND));

        String otp = String.valueOf((int) (Math.random() * 900000) + 100000);
        otpStorage.put(email, new OtpDetails(otp, LocalDateTime.now().plusMinutes(5)));

        System.out.println("=================================================");
        System.out.println("NUMS BANK MOCK SECURITY ALERTS OTP GENERATOR");
        System.out.println("Recipient: " + email);
        System.out.println("OTP Code: " + otp);
        System.out.println("Valid for: 5 minutes");
        System.out.println("=================================================");

        return otp;
    }

    @Transactional
    public void verifyForgotPasswordOtp(String email, String otp, String newPassword) {
        OtpDetails details = otpStorage.get(email);
        if (details == null || details.isExpired() || !details.getOtp().equals(otp)) {
            throw new CustomException("Invalid or expired OTP code.", HttpStatus.BAD_REQUEST);
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("User not found.", HttpStatus.NOT_FOUND));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        otpStorage.remove(email);
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

    private static class OtpDetails {
        private final String otp;
        private final LocalDateTime expiryTime;

        public OtpDetails(String otp, LocalDateTime expiryTime) {
            this.otp = otp;
            this.expiryTime = expiryTime;
        }

        public String getOtp() { return otp; }
        public boolean isExpired() { return LocalDateTime.now().isAfter(expiryTime); }
    }
}
