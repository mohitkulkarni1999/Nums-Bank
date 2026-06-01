package com.numsbank.loan.controller;

import com.numsbank.loan.entity.Loan;
import com.numsbank.loan.entity.User;
import com.numsbank.loan.service.LoanService;
import com.numsbank.loan.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/loans")
@CrossOrigin(origins = "https://nums-bank.vercel.app", allowCredentials = "true")
public class LoanController {

    private final LoanService loanService;
    private final UserService userService;

    public LoanController(LoanService loanService, UserService userService) {
        this.loanService = loanService;
        this.userService = userService;
    }

    @PostMapping("/calculate-emi")
    public ResponseEntity<?> calculateEmi(@RequestBody Map<String, Object> body) {
        BigDecimal principal = new BigDecimal(body.get("principal").toString());
        BigDecimal rate = new BigDecimal(body.get("rate").toString());
        int tenure = Integer.parseInt(body.get("tenure").toString());

        Map<String, Object> emiCalculation = loanService.calculateEmi(principal, rate, tenure);
        return ResponseEntity.ok(emiCalculation);
    }

    @PostMapping("/apply")
    public ResponseEntity<?> applyForLoan(@RequestBody Map<String, Object> body) {
        User user = userService.getCurrentUser();
        String type = (String) body.get("type");
        BigDecimal amount = new BigDecimal(body.get("amount").toString());
        int tenureYears = Integer.parseInt(body.get("tenure").toString());
        int tenureMonths = tenureYears * 12;

        Loan loan = loanService.applyForLoan(user, type, amount, tenureMonths);
        return ResponseEntity.ok(loan);
    }

    @GetMapping("/my-loans")
    public ResponseEntity<?> getMyLoans() {
        User user = userService.getCurrentUser();
        List<Loan> loans = loanService.getUserLoans(user);
        return ResponseEntity.ok(loans);
    }

    @PostMapping("/prepayment-calculator")
    public ResponseEntity<?> calculatePrepayment(@RequestBody Map<String, Object> body) {
        User user = userService.getCurrentUser();
        Long loanId = Long.valueOf(body.get("loanId").toString());
        BigDecimal extraAmount = new BigDecimal(body.get("extraAmount").toString());

        Map<String, Object> prepayDetails = loanService.calculatePrepayment(loanId, extraAmount, user);
        return ResponseEntity.ok(prepayDetails);
    }

    @PostMapping("/pay-off")
    public ResponseEntity<?> payOffLoan(@RequestBody Map<String, Object> body, @RequestHeader("Authorization") String authHeader) {
        User user = userService.getCurrentUser();
        Long loanId = Long.valueOf(body.get("loanId").toString());

        Map<String, Object> result = loanService.payOffLoan(loanId, user, authHeader);
        return ResponseEntity.ok(result);
    }
}
