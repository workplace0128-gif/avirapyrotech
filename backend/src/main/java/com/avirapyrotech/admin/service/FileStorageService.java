package com.avirapyrotech.admin.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.Iterator;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    private static final String[] SUPPORTED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"};

    public FileStorageService(@Value("${app.upload.dir:./uploads}") String uploadDir) {
        Path path = Paths.get(uploadDir);
        // Automatically use Railway volume mounted at /uploads if using default relative path
        if (!path.isAbsolute() && Files.exists(Paths.get("/uploads")) && Files.isDirectory(Paths.get("/uploads"))) {
            path = Paths.get("/uploads");
        }
        this.fileStorageLocation = path.toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
            Files.createDirectories(this.fileStorageLocation.resolve("products"));
            Files.createDirectories(this.fileStorageLocation.resolve("categories"));
            Files.createDirectories(this.fileStorageLocation.resolve("banners"));
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    public String storeFile(MultipartFile file, String subFolder) {
        // Validate file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds limit of 5MB");
        }

        // Validate file name and extension
        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null || originalFileName.contains("..")) {
            throw new IllegalArgumentException("Invalid file name format");
        }

        String fileExtension = getFileExtension(originalFileName).toLowerCase();
        if (Arrays.stream(SUPPORTED_EXTENSIONS).noneMatch(ext -> ext.equals(fileExtension))) {
            throw new IllegalArgumentException("Unsupported file type. Only JPG, JPEG, PNG, and WEBP are supported.");
        }

        // Generate unique name
        String targetFileName = UUID.randomUUID().toString() + ".jpg"; // Normalize output to jpg for maximum compatibility and compression
        Path targetLocation = this.fileStorageLocation.resolve(subFolder).resolve(targetFileName);

        try {
            // Resize and optimize image
            BufferedImage originalImage = ImageIO.read(file.getInputStream());
            if (originalImage == null) {
                throw new IllegalArgumentException("Could not read image data");
            }

            BufferedImage resizedImage = resizeImage(originalImage, 1000); // Limit width to 1000px
            writeCompressedImage(resizedImage, targetLocation.toFile(), 0.75f); // 75% quality JPEG

            // Return the relative URL path (web-accessible)
            return "/api/uploads/" + subFolder + "/" + targetFileName;
        } catch (IOException ex) {
            throw new RuntimeException("Failed to store and optimize file: " + originalFileName, ex);
        }
    }

    public void deleteFile(String fileUrl) {
        if (fileUrl == null || !fileUrl.contains("/uploads/")) {
            return;
        }
        
        try {
            String relativePath = fileUrl.substring(fileUrl.indexOf("/uploads/") + 9);
            Path filePath = this.fileStorageLocation.resolve(relativePath).normalize();
            Files.deleteIfExists(filePath);
        } catch (Exception e) {
            // Log warning but don't break operation
            System.err.println("Warning: Could not delete file: " + fileUrl + ". Error: " + e.getMessage());
        }
    }

    private String getFileExtension(String fileName) {
        int lastIndexOf = fileName.lastIndexOf(".");
        if (lastIndexOf == -1) {
            return "";
        }
        return fileName.substring(lastIndexOf + 1);
    }

    private BufferedImage resizeImage(BufferedImage originalImage, int maxTargetWidth) {
        int width = originalImage.getWidth();
        int height = originalImage.getHeight();

        if (width <= maxTargetWidth) {
            return originalImage; // No scaling needed
        }

        int targetHeight = (int) (((double) height / width) * maxTargetWidth);
        
        BufferedImage resizedImage = new BufferedImage(maxTargetWidth, targetHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = resizedImage.createGraphics();
        
        // Use high-quality rendering hints
        g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        
        g2d.drawImage(originalImage, 0, 0, maxTargetWidth, targetHeight, null);
        g2d.dispose();
        
        return resizedImage;
    }

    private void writeCompressedImage(BufferedImage image, File targetFile, float quality) throws IOException {
        Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName("jpg");
        if (!writers.hasNext()) {
            throw new IllegalStateException("No JPG image writer available");
        }
        ImageWriter writer = writers.next();
        
        try (OutputStream os = new FileOutputStream(targetFile);
             ImageOutputStream ios = ImageIO.createImageOutputStream(os)) {
            
            writer.setOutput(ios);
            ImageWriteParam param = writer.getDefaultWriteParam();
            
            if (param.canWriteCompressed()) {
                param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
                param.setCompressionType(param.getCompressionTypes()[0]);
                param.setCompressionQuality(quality);
            }
            
            writer.write(null, new IIOImage(image, null, null), param);
        } finally {
            writer.dispose();
        }
    }
}
