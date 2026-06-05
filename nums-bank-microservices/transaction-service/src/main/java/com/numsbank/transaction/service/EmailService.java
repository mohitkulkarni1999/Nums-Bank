package com.numsbank.transaction.service;

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

    public void sendTransactionAlert(String to, String transactionType, String amount, String accountNumber, String balance) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("NUMS Bank - Transaction Alert");
            helper.setText(buildTransactionAlertEmail(transactionType, amount, accountNumber, balance), true);

            mailSender.send(message);
            logger.info("Transaction alert email sent successfully to: {}", to);
        } catch (Exception e) {
            logger.error("Failed to send transaction alert email to: {}", to, e);
            // Don't throw exception - transaction should not fail due to email
        }
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
}
