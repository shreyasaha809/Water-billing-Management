package com.waterbilling1.water_billing_system.serviceImpl;

import com.waterbilling1.water_billing_system.service.FileStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Slf4j
@Service
public class FileStorageServiceImpl implements FileStorageService {

    private static final String UPLOAD_DIR = "uploads/tickets";

    @Override
    public String storeFile(MultipartFile file) {
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalName = file.getOriginalFilename();
            String extension = originalName != null && originalName.contains(".")
                    ? originalName.substring(originalName.lastIndexOf("."))
                    : "";
            String storedName = UUID.randomUUID() + extension;

            Path targetPath = uploadPath.resolve(storedName);
            Files.copy(file.getInputStream(), targetPath);

            return "/uploads/tickets/" + storedName;

        } catch (IOException e) {
            log.error("Failed to store file: {}", e.getMessage());
            throw new RuntimeException("Failed to store file: " + e.getMessage());
        }
    }
}