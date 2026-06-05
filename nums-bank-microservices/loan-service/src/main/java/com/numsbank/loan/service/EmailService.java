package com.numsbank.loan.service;

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

    public void sendLoanApprovalEmail(String to, String loanType, String amount, String tenure) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("NUMS Bank - Loan Approved");
            helper.setText(buildLoanApprovalEmail(loanType, amount, tenure), true);

            mailSender.send(message);
            logger.info("Loan approval email sent successfully to: {}", to);
        } catch (Exception e) {
            logger.error("Failed to send loan approval email to: {}", to, e);
            // Don't throw exception - loan approval should not fail due to email
        }
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
