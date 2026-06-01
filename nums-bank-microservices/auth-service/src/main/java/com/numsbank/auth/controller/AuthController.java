package com.numsbank.auth.controller;

import com.numsbank.auth.config.JwtTokenProvider;
import com.numsbank.auth.entity.User;
import com.numsbank.auth.exception.CustomException;
import com.numsbank.auth.service.AuditService;
import com.numsbank.auth.service.LoginAttemptService;
import com.numsbank.auth.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "https://nums-bank.vercel.app", allowCredentials = "true")
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final LoginAttemptService loginAttemptService;
    private final AuditService auditService;

    public AuthController(UserService userService,
                          AuthenticationManager authenticationManager,
                          JwtTokenProvider tokenProvider,
                          LoginAttemptService loginAttemptService,
                          AuditService auditService) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.loginAttemptService = loginAttemptService;
        this.auditService = auditService;
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        return (ip != null && !ip.isEmpty()) ? ip.split(",")[0].trim() : request.getRemoteAddr();
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest request,
                                          HttpServletRequest httpRequest) {
        User user = userService.register(
                request.getName(), request.getEmail(), request.getPhone(),
                request.getPassword(), request.getPanNumber(), request.getAadharNumber()
        );
        auditService.log(user.getId(), user.getEmail(), "REGISTRATION",
                "New user registered", getClientIp(httpRequest));

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Registration successful. You can now log in.");
        response.put("userId", user.getId());
        response.put("email", user.getEmail());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest request,
                                              HttpServletRequest httpRequest) {
        String ip = getClientIp(httpRequest);

        if (loginAttemptService.isLocked(request.getEmail())) {
            LocalDateTime lockedUntil = loginAttemptService.getLockedUntil(request.getEmail());
            throw new CustomException(
                "Account temporarily locked due to too many failed attempts. Try again after " + lockedUntil,
                HttpStatus.TOO_MANY_REQUESTS
            );
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            loginAttemptService.recordSuccess(request.getEmail());

            String jwt = tokenProvider.generateToken(authentication);
            User user = userService.getCurrentUserContextByEmail(request.getEmail());

            auditService.log(user.getId(), user.getEmail(), "LOGIN_SUCCESS",
                    "Successful login from IP: " + ip, ip);

            Map<String, Object> response = new HashMap<>();
            response.put("token", jwt);
            response.put("userDetails", userService.toSafeUserResponse(user));
            return ResponseEntity.ok(response);

        } catch (BadCredentialsException ex) {
            loginAttemptService.recordFailure(request.getEmail());
            auditService.log(null, request.getEmail(), "LOGIN_FAILED",
                    "Failed login attempt from IP: " + ip, ip);
            throw new CustomException("Invalid email or password.", HttpStatus.UNAUTHORIZED);

        } catch (DisabledException ex) {
            auditService.log(null, request.getEmail(), "LOGIN_DISABLED",
                    "Login attempt on disabled/unapproved account", ip);
            throw new CustomException("Account is pending approval or has been deactivated.", HttpStatus.FORBIDDEN);
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body,
                                            HttpServletRequest httpRequest) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            throw new CustomException("Email is required.", HttpStatus.BAD_REQUEST);
        }
        userService.generateForgotPasswordOtp(email);
        auditService.log(null, email, "PASSWORD_RESET_REQUESTED",
                "OTP requested for password reset", getClientIp(httpRequest));

        Map<String, Object> response = new HashMap<>();
        response.put("message", "OTP sent to registered email/phone. Valid for 5 minutes.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body,
                                       HttpServletRequest httpRequest) {
        String email = body.get("email");
        String otp = body.get("otp");
        String newPassword = body.get("newPassword");

        userService.verifyForgotPasswordOtp(email, otp, newPassword);
        auditService.log(null, email, "PASSWORD_RESET_SUCCESS",
                "Password reset via OTP", getClientIp(httpRequest));

        Map<String, String> response = new HashMap<>();
        response.put("message", "Password has been reset successfully.");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(userService.toSafeUserResponse(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> body,
                                           HttpServletRequest httpRequest) {
        String fullName = body.get("fullName");
        String phone = body.get("phone");
        if (fullName == null || fullName.isBlank() || phone == null || phone.isBlank()) {
            throw new CustomException("Full name and phone are required.", HttpStatus.BAD_REQUEST);
        }
        User updated = userService.updateProfile(fullName.trim(), phone.trim());
        auditService.log(updated.getId(), updated.getEmail(), "PROFILE_UPDATED",
                "Profile details updated", getClientIp(httpRequest));
        return ResponseEntity.ok(userService.toSafeUserResponse(updated));
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> body,
                                            HttpServletRequest httpRequest) {
        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");
        if (currentPassword == null || newPassword == null || newPassword.length() < 8) {
            throw new CustomException("Current password and a new password (min 8 chars) are required.", HttpStatus.BAD_REQUEST);
        }
        userService.changePassword(currentPassword, newPassword);
        User user = userService.getCurrentUser();
        auditService.log(user.getId(), user.getEmail(), "PASSWORD_CHANGED",
                "Password changed by user", getClientIp(httpRequest));
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password changed successfully.");
        return ResponseEntity.ok(response);
    }


    @GetMapping("/audit-logs")
    public ResponseEntity<?> getMyAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(auditService.getUserAuditLogs(user.getId(), page, size));
    }

    public static class RegisterRequest {
        @NotBlank(message = "Full Name is required.")
        @Size(max = 100)
        private String name;

        @NotBlank(message = "Email is required.")
        @Email(message = "Invalid email format.")
        @Size(max = 100)
        private String email;

        @NotBlank(message = "Phone number is required.")
        @Size(min = 10, max = 15)
        private String phone;

        @NotBlank(message = "Password is required.")
        @Size(min = 8, max = 100)
        private String password;

        @NotBlank(message = "PAN number is required.")
        @Pattern(regexp = "[A-Z]{5}[0-9]{4}[A-Z]{1}", message = "Invalid PAN number format.")
        private String panNumber;

        @NotBlank(message = "Aadhaar number is required.")
        @Size(min = 12, max = 12, message = "Aadhaar number must be exactly 12 digits.")
        private String aadharNumber;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getPanNumber() { return panNumber; }
        public void setPanNumber(String panNumber) { this.panNumber = panNumber; }
        public String getAadharNumber() { return aadharNumber; }
        public void setAadharNumber(String aadharNumber) { this.aadharNumber = aadharNumber; }
    }

    public static class LoginRequest {
        @NotBlank(message = "Email is required.")
        @Email(message = "Invalid email format.")
        private String email;

        @NotBlank(message = "Password is required.")
        private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
}
