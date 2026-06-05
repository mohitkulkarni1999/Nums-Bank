package com.numsbank.account.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.from}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendAccountCreationEmail(String to, String accountNumber, String accountType, String initialBalance) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("NUMS Bank - New Account Created");
            helper.setText(buildAccountCreationEmail(accountNumber, accountType, initialBalance), true);

            mailSender.send(message);
            logger.info("Account creation email sent successfully to: {}", to);
        } catch (Exception e) {
            logger.error("Failed to send account creation email to: {}", to, e);
            // Don't throw exception - account creation should not fail due to email
        }
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
}
