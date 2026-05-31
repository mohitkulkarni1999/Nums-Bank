package com.numsbank.auth.service;

import com.numsbank.auth.entity.User;
import com.numsbank.auth.exception.CustomException;
import com.numsbank.auth.repository.UserRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private final Map<String, OtpDetails> otpStorage = new ConcurrentHashMap<>();

    public UserService(UserRepository userRepository,
                       @Lazy PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
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

        return userRepository.save(user);
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
