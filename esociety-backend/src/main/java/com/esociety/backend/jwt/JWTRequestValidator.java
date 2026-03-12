package com.esociety.backend.jwt;

import com.esociety.backend.services.MyUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JWTRequestValidator extends OncePerRequestFilter {

    @Autowired
    private final JWTTokenGenerator jwtTokenGenerator;

    @Autowired
    private final MyUserDetailsService myUserDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        final String header = request.getHeader("Authorization");
        String jwtToken = null;
        String email = null;
        String role = null;

        // Step 1 - Extract token from header
        if (header != null && header.startsWith("Bearer ")) {
            jwtToken = header.substring(7);
            try {
                email = jwtTokenGenerator.extractEmail(jwtToken);
                role = jwtTokenGenerator.extractRole(jwtToken);
            } catch (Exception e) {
                System.out.println("Invalid Token: " + e.getMessage());
            }
        }

        // Step 2 - Validate token and set authentication
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = myUserDetailsService.loadUserByUsername(email);
            if (jwtTokenGenerator.validateToken(jwtToken, userDetails)) {
                List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(role));

                System.out.println("ROLE FROM TOKEN = " + role);
                System.out.println("AUTHORITIES SET = " + authorities);

                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(userDetails, null, authorities);
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        filterChain.doFilter(request, response);
    }
}