package com.waterbilling1.water_billing_system.config;

import com.waterbilling1.water_billing_system.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.*;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtUtil jwtUtil;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:5173", "http://localhost:3000")
                .addInterceptors(new JwtHandshakeInterceptor(jwtUtil))
                .withSockJS();
    }

    public static class JwtHandshakeInterceptor implements HandshakeInterceptor {
        private final JwtUtil jwtUtil;

        public JwtHandshakeInterceptor(JwtUtil jwtUtil) {
            this.jwtUtil = jwtUtil;
        }

        @Override
        public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                       WebSocketHandler wsHandler, Map<String, Object> attributes) {
            if (request instanceof ServletServerHttpRequest servletRequest) {
                String token = servletRequest.getServletRequest().getParameter("token");
                if (token != null) {
                    try {
                        Long userId = jwtUtil.extractUserId(token);
                        attributes.put("householdUserId", userId);
                        return true;
                    } catch (Exception e) {
                        return false;
                    }
                }
            }
            return false;
        }

        @Override
        public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Exception exception) {
        }
    }
}
