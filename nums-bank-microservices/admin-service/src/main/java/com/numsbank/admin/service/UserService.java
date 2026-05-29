package com.numsbank.admin.service;

import com.numsbank.admin.entity.User;
import com.numsbank.admin.exception.CustomException;
import com.numsbank.admin.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
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
}
