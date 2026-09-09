package com.waterbilling1.water_billing_system.serviceImpl;

import com.waterbilling1.water_billing_system.dto.ChatRequest;
import com.waterbilling1.water_billing_system.dto.ChatResponse;
import com.waterbilling1.water_billing_system.service.AiAssistantService;
import com.waterbilling1.water_billing_system.service.AiDataToolService;
import com.waterbilling1.water_billing_system.service.AiProvider;
import com.waterbilling1.water_billing_system.util.AiPromptBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AiAssistantServiceImpl implements AiAssistantService {

    private final AiProvider aiProvider;
    private final AiDataToolService dataToolService;

    private static final Pattern NAV_PATTERN = Pattern.compile("\\[NAVIGATE:(\\w+)]");

    @Override
    public ChatResponse chat(Long userId, String role, String fullName, ChatRequest request) {
        String dataContext = dataToolService.buildDataContext(userId, role, request.getMessage());
        String systemPrompt = AiPromptBuilder.buildSystemPrompt(
                role, fullName, request.getCurrentPage() != null ? request.getCurrentPage() : "dashboard", dataContext);

        String rawReply = aiProvider.generateReply(systemPrompt, request.getMessage());

        String navigation = null;
        Matcher matcher = NAV_PATTERN.matcher(rawReply);
        if (matcher.find()) {
            navigation = matcher.group(1);
            rawReply = rawReply.replace(matcher.group(0), "").trim();
        }

        return ChatResponse.builder().reply(rawReply).suggestedNavigation(navigation).build();
    }
}