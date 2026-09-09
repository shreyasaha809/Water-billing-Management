package com.waterbilling1.water_billing_system.security;

import com.waterbilling1.water_billing_system.util.JwtUtil;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    private static final String HEADER_NAME = "Authorization";
    private static final String TOKEN_PREFIX = "Bearer ";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {


        String path = request.getServletPath();

        // Allow login and register without JWT authentication
        if (path.equals("/api/auth/login") ||
                path.equals("/api/auth/register")) {

            filterChain.doFilter(request, response);
            return;
        }


        String authHeader = request.getHeader(HEADER_NAME);

        // No token found, continue normally
        if (authHeader == null || !authHeader.startsWith(TOKEN_PREFIX)) {
            filterChain.doFilter(request, response);
            return;
        }


        String token = authHeader.substring(TOKEN_PREFIX.length());

        try {

            String email = jwtUtil.extractEmail(token);

            if (email != null &&
                    SecurityContextHolder.getContext().getAuthentication() == null) {


                UserDetails userDetails =
                        userDetailsService.loadUserByUsername(email);


                if (jwtUtil.isTokenValid(token, userDetails.getUsername())) {


                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );


                    authToken.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );


                    SecurityContextHolder.getContext()
                            .setAuthentication(authToken);
                }
            }


        } catch (JwtException | IllegalArgumentException ex) {

            SecurityContextHolder.clearContext();
        }


        filterChain.doFilter(request, response);
    }
}