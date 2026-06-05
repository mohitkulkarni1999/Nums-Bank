package com.numsbank.auth.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.from}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Transactional
    public void sendEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            logger.info("Email sent successfully to: {}", to);
        } catch (Exception e) {
            logger.error("Failed to send email to: {}", to, e);
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void sendRegistrationEmail(String to, String fullName) {
        String subject = "Welcome to NUMS Bank - Your Account is Ready";
        String htmlContent = buildRegistrationEmail(fullName);
        sendEmail(to, subject, htmlContent);
    }

    @Transactional
    public void sendOtpEmail(String to, String otp) {
        String subject = "NUMS Bank - Password Reset OTP";
        String htmlContent = buildOtpEmail(otp);
        sendEmail(to, subject, htmlContent);
    }

    @Transactional
    public void sendTransactionAlert(String to, String transactionType, String amount, String accountNumber, String balance) {
        String subject = "NUMS Bank - Transaction Alert";
        String htmlContent = buildTransactionAlertEmail(transactionType, amount, accountNumber, balance);
        sendEmail(to, subject, htmlContent);
    }

    @Transactional
    public void sendAccountCreationEmail(String to, String accountNumber, String accountType, String initialBalance) {
        String subject = "NUMS Bank - New Account Created";
        String htmlContent = buildAccountCreationEmail(accountNumber, accountType, initialBalance);
        sendEmail(to, subject, htmlContent);
    }

    @Transactional
    public void sendLoanApprovalEmail(String to, String loanType, String amount, String tenure) {
        String subject = "NUMS Bank - Loan Approved";
        String htmlContent = buildLoanApprovalEmail(loanType, amount, tenure);
        sendEmail(to, subject, htmlContent);
    }

    private String buildRegistrationEmail(String fullName) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); padding: 30px; text-align: center; color: #1a1a1a; }
                    .header h1 { margin: 0; font-size: 28px; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 10px; margin-top: 20px; }
                    .button { display: inline-block; padding: 12px 30px; background: #FFD700; color: #1a1a1a; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>NUMS BANK</h1>
                        <p>Banking Made Simple & Secure</p>
                    </div>
                    <div class="content">
                        <h2>Welcome to NUMS Bank, %s!</h2>
                        <p>Thank you for registering with NUMS Bank. Your account has been successfully created and is ready to use.</p>
                        <p><strong>What's Next?</strong></p>
                        <ul>
                            <li>Create your Savings or Current account</li>
                            <li>Set up your transaction PIN</li>
                            <li>Explore our banking services</li>
                        </ul>
                        <a href="https://nums-bank.vercel.app/dashboard" class="button">Go to Dashboard</a>
                    </div>
                    <div class="footer">
                        <p>&copy; 2024 NUMS Bank. All rights reserved.</p>
                        <p>This is an automated email. Please do not reply.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(fullName);
    }

    private String buildOtpEmail(String otp) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); padding: 30px; text-align: center; color: #1a1a1a; }
                    .header h1 { margin: 0; font-size: 28px; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 10px; margin-top: 20px; }
                    .otp { font-size: 36px; font-weight: bold; color: #FFD700; text-align: center; margin: 20px 0; letter-spacing: 5px; }
                    .warning { color: #e74c3c; font-size: 12px; margin-top: 20px; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>NUMS BANK</h1>
                        <p>Password Reset Request</p>
                    </div>
                    <div class="content">
                        <h2>Your OTP Code</h2>
                        <p>You have requested to reset your password. Use the following One-Time Password (OTP) to proceed:</p>
                        <div class="otp">%s</div>
                        <p><strong>Important:</strong></p>
                        <ul>
                            <li>This OTP is valid for 5 minutes only</li>
                            <li>Do not share this OTP with anyone</li>
                            <li>If you didn't request this, please ignore this email</li>
                        </ul>
                        <p class="warning">NUMS Bank will never ask for your OTP via phone or email.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2024 NUMS Bank. All rights reserved.</p>
                        <p>This is an automated email. Please do not reply.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(otp);
    }

    private String buildTransactionAlertEmail(String transactionType, String amount, String accountNumber, String balance) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); padding: 30px; text-align: center; color: #1a1a1a; }
                    .header h1 { margin: 0; font-size: 28px; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 10px; margin-top: 20px; }
                    .transaction-details { background: #fff; padding: 20px; border-radius: 5px; margin: 20px 0; }
                    .transaction-details p { margin: 10px 0; }
                    .transaction-details strong { color: #FFD700; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>NUMS BANK</h1>
                        <p>Transaction Alert</p>
                    </div>
                    <div class="content">
                        <h2>Transaction Completed</h2>
                        <p>A transaction has been completed on your account:</p>
                        <div class="transaction-details">
                            <p><strong>Transaction Type:</strong> %s</p>
                            <p><strong>Amount:</strong> ₹%s</p>
                            <p><strong>Account:</strong> %s</p>
                            <p><strong>Available Balance:</strong> ₹%s</p>
                        </div>
                        <p>If you did not authorize this transaction, please contact our support team immediately.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2024 NUMS Bank. All rights reserved.</p>
                        <p>This is an automated email. Please do not reply.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(transactionType, amount, accountNumber, balance);
    }

    private String buildAccountCreationEmail(String accountNumber, String accountType, String initialBalance) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); padding: 30px; text-align: center; color: #1a1a1a; }
                    .header h1 { margin: 0; font-size: 28px; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 10px; margin-top: 20px; }
                    .account-details { background: #fff; padding: 20px; border-radius: 5px; margin: 20px 0; }
                    .account-details p { margin: 10px 0; }
                    .account-details strong { color: #FFD700; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>NUMS BANK</h1>
                        <p>New Account Created</p>
                    </div>
                    <div class="content">
                        <h2>Your %s Account is Ready</h2>
                        <p>Your new bank account has been successfully created:</p>
                        <div class="account-details">
                            <p><strong>Account Number:</strong> %s</p>
                            <p><strong>Account Type:</strong> %s</p>
                            <p><strong>Initial Balance:</strong> ₹%s</p>
                        </div>
                        <p>You can now use this account for all your banking transactions.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2024 NUMS Bank. All rights reserved.</p>
                        <p>This is an automated email. Please do not reply.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(accountType, accountNumber, accountType, initialBalance);
    }

    private String buildLoanApprovalEmail(String loanType, String amount, String tenure) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); padding: 30px; text-align: center; color: #1a1a1a; }
                    .header h1 { margin: 0; font-size: 28px; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 10px; margin-top: 20px; }
                    .loan-details { background: #fff; padding: 20px; border-radius: 5px; margin: 20px 0; }
                    .loan-details p { margin: 10px 0; }
                    .loan-details strong { color: #FFD700; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>NUMS BANK</h1>
                        <p>Loan Approved</p>
                    </div>
                    <div class="content">
                        <h2>Congratulations! Your Loan Has Been Approved</h2>
                        <p>Your %s loan application has been approved:</p>
                        <div class="loan-details">
                            <p><strong>Loan Type:</strong> %s</p>
                            <p><strong>Loan Amount:</strong> ₹%s</p>
                            <p><strong>Tenure:</strong> %s years</p>
                        </div>
                        <p>The loan amount will be credited to your account shortly.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2024 NUMS Bank. All rights reserved.</p>
                        <p>This is an automated email. Please do not reply.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(loanType, loanType, amount, tenure);
    }
}
