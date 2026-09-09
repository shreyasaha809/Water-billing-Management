package com.waterbilling1.water_billing_system.serviceImpl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.waterbilling1.water_billing_system.service.AiProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.Map;

@Slf4j
@Service
public class GeminiAiProvider implements AiProvider {

    @Value("${ai.gemini.api-key}")
    private String apiKey;

    @Value("${ai.gemini.model:gemini-2.0-flash}")
    private String model;

    private final WebClient webClient = WebClient.builder()
            .baseUrl("https://generativelanguage.googleapis.com")
            .build();

    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    public String generateReply(String systemPrompt, String userMessage) {
        try {
            Map<String, Object> body = Map.of(
                    "systemInstruction", Map.of("parts", new Object[]{Map.of("text", systemPrompt)}),
                    "contents", new Object[]{
                            Map.of("role", "user", "parts", new Object[]{Map.of("text", userMessage)})
                    }
            );

            String response = webClient.post()
                    .uri("/v1beta/models/{model}:generateContent", model)
                    // AQ. (auth key) prefers the header form. If your key ever goes back
                    // to the old AIza format, this header still works fine for that too.
                    .header("x-goog-api-key", apiKey.trim())
                    .header("Content-Type", "application/json")
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode root = mapper.readTree(response);
            JsonNode textNode = root.path("candidates").path(0).path("content").path("parts").path(0).path("text");

            if (textNode.isMissingNode()) {
                log.error("Gemini response had no text. Full response: {}", response);
                return "I'm having trouble reaching the AI service right now. Please try again in a moment.";
            }

            return textNode.asText();

        } catch (WebClientResponseException e) {
            // This is the important part: log the ACTUAL error Google sent back,
            // not just a generic exception message.
            log.error("Gemini API call failed. status={}, body={}",
                    e.getStatusCode(), e.getResponseBodyAsString());
            return "I'm having trouble reaching the AI service right now. Please try again in a moment.";
        } catch (Exception e) {
            log.error("Gemini API call failed with unexpected error", e);
            return "I'm having trouble reaching the AI service right now. Please try again in a moment.";
        }
    }
}