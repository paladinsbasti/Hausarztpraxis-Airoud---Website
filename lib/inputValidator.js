// Enhanced Input Validation for Hausarztpraxis Airoud
// Schützt vor Malicious Uploads, Content Injection und Data Corruption

const fs = require('fs');
const path = require('path');

class InputValidator {
    constructor() {
        // Allowed MIME types for images
        this.allowedImageTypes = [
            'image/jpeg',
            'image/jpg', 
            'image/png',
            'image/gif',
            'image/webp'
        ];

        // Allowed file extensions
        this.allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

        // Dangerous file signatures (magic bytes)
        this.dangerousSignatures = [
            Buffer.from([0x4D, 0x5A]),                    // PE executable
            Buffer.from([0x50, 0x4B, 0x03, 0x04]),       // ZIP/JAR
            Buffer.from([0x50, 0x4B, 0x05, 0x06]),       // ZIP empty
            Buffer.from([0x50, 0x4B, 0x07, 0x08]),       // ZIP spanned
            Buffer.from([0x7F, 0x45, 0x4C, 0x46]),       // ELF executable
            Buffer.from([0xCA, 0xFE, 0xBA, 0xBE]),       // Java class
            Buffer.from([0xFE, 0xED, 0xFA, 0xCE]),       // Mach-O binary
            Buffer.from([0x3C, 0x3F, 0x70, 0x68, 0x70]), // PHP script
            Buffer.from([0x3C, 0x73, 0x63, 0x72, 0x69, 0x70, 0x74]), // <script
        ];

        // Maximum field lengths
        this.fieldLimits = {
            title: 100,
            subtitle: 200,
            description: 1000,
            name: 50,
            email: 100,
            phone: 20,
            address: 300,
            feature: 50,
            message: 500
        };
    }

    // Validate uploaded file
    validateFile(file, options = {}) {
        const errors = [];
        
        if (!file) {
            return { valid: false, errors: ['No file provided'] };
        }

        // Check file size
        const maxSize = options.maxSize || 2 * 1024 * 1024; // 2MB default
        if (file.size > maxSize) {
            errors.push(`File too large. Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB`);
        }

        // Check file extension
        const ext = path.extname(file.originalname).toLowerCase();
        if (!this.allowedExtensions.includes(ext)) {
            errors.push(`Invalid file extension. Allowed: ${this.allowedExtensions.join(', ')}`);
        }

        // Check MIME type
        if (!this.allowedImageTypes.includes(file.mimetype)) {
            errors.push(`Invalid file type. Allowed: ${this.allowedImageTypes.join(', ')}`);
        }

        // Validate filename
        const filename = file.originalname;
        if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
            errors.push('Filename contains invalid characters. Use only letters, numbers, dots, hyphens and underscores.');
        }

        // Check for double extensions (potential bypass attempt)
        const parts = filename.split('.');
        if (parts.length > 2) {
            errors.push('Multiple file extensions not allowed');
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    // Validate file content (magic bytes)
    async validateFileContent(filePath) {
        try {
            const buffer = fs.readFileSync(filePath);
            
            // Check file signature
            for (const signature of this.dangerousSignatures) {
                if (buffer.subarray(0, signature.length).equals(signature)) {
                    return {
                        valid: false,
                        error: 'File contains dangerous content signature'
                    };
                }
            }

            // Validate image headers for common formats
            if (!this.validateImageHeader(buffer)) {
                return {
                    valid: false,
                    error: 'Invalid image file format'
                };
            }

            // Check for embedded scripts in images
            const content = buffer.toString('utf8', 0, Math.min(buffer.length, 1024));
            if (this.containsScript(content)) {
                return {
                    valid: false,
                    error: 'File contains embedded script content'
                };
            }

            return { valid: true };
        } catch (error) {
            return {
                valid: false,
                error: `File validation error: ${error.message}`
            };
        }
    }

    // Validate image file headers
    validateImageHeader(buffer) {
        if (buffer.length < 8) return false;

        // JPEG
        if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
            return true;
        }

        // PNG
        if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))) {
            return true;
        }

        // GIF87a or GIF89a
        if (buffer.subarray(0, 6).equals(Buffer.from('GIF87a')) || 
            buffer.subarray(0, 6).equals(Buffer.from('GIF89a'))) {
            return true;
        }

        // WebP
        if (buffer.subarray(0, 4).equals(Buffer.from('RIFF')) && 
            buffer.subarray(8, 12).equals(Buffer.from('WEBP'))) {
            return true;
        }

        return false;
    }

    // Check for script content
    containsScript(content) {
        const scriptPatterns = [
            /<script[\s\S]*?>/i,
            /javascript:/i,
            /on\w+\s*=/i,
            /<iframe[\s\S]*?>/i,
            /<object[\s\S]*?>/i,
            /<embed[\s\S]*?>/i,
            /eval\s*\(/i,
            /function\s*\(/i,
            /document\./i,
            /window\./i
        ];

        return scriptPatterns.some(pattern => pattern.test(content));
    }

    // Validate text input fields
    validateField(fieldName, value, options = {}) {
        const errors = [];

        if (!value || typeof value !== 'string') {
            if (options.required) {
                errors.push(`${fieldName} is required`);
            }
            return { valid: !options.required, errors };
        }

        // Check length
        const maxLength = options.maxLength || this.fieldLimits[fieldName] || 500;
        if (value.length > maxLength) {
            errors.push(`${fieldName} too long. Maximum ${maxLength} characters.`);
        }

        // Check for dangerous content
        if (this.containsDangerousContent(value)) {
            errors.push(`${fieldName} contains potentially dangerous content`);
        }

        // Email validation
        if (fieldName === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                errors.push('Invalid email format');
            }
        }

        // Phone validation
        if (fieldName === 'phone' && value) {
            const phoneRegex = /^[\d\s\+\-\(\)\/]+$/;
            if (!phoneRegex.test(value)) {
                errors.push('Invalid phone number format');
            }
        }

        // URL validation for image fields
        if ((fieldName.includes('Image') || fieldName.includes('image')) && value) {
            if (!this.validateImageUrl(value)) {
                errors.push('Invalid image URL format');
            }
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    // Check for dangerous content patterns
    containsDangerousContent(value) {
        const dangerousPatterns = [
            /<script[\s\S]*?>/i,
            /javascript:/i,
            /data:text\/html/i,
            /vbscript:/i,
            /on\w+\s*=/i,
            /<iframe[\s\S]*?>/i,
            /<object[\s\S]*?>/i,
            /<embed[\s\S]*?>/i,
            /<link[\s\S]*?>/i,
            /<meta[\s\S]*?>/i,
            /eval\s*\(/i,
            /expression\s*\(/i,
            /url\s*\(/i,
            /import\s*\(/i,
            /document\./i,
            /window\./i,
            /alert\s*\(/i,
            /confirm\s*\(/i,
            /prompt\s*\(/i
        ];

        return dangerousPatterns.some(pattern => pattern.test(value));
    }

    // Validate image URL format
    validateImageUrl(url) {
        if (url.startsWith('images/')) {
            // Local image path
            const filename = path.basename(url);
            return /^[a-zA-Z0-9._-]+$/.test(filename);
        }
        
        if (url.startsWith('http://') || url.startsWith('https://')) {
            // External URL - basic validation
            try {
                new URL(url);
                return true;
            } catch {
                return false;
            }
        }

        return false;
    }

    // Validate complete form data
    validateFormData(data) {
        const errors = {};
        const validatedData = {};

        // Define required fields
        const requiredFields = ['intro_title'];

        for (const [key, value] of Object.entries(data)) {
            if (key === '_csrf') continue; // Skip CSRF token

            const fieldName = key.replace(/^(intro_|services_|about_|contact_|vacation_|modal_)/, '');
            const isRequired = requiredFields.includes(key);

            const validation = this.validateField(fieldName, value, { 
                required: isRequired,
                maxLength: this.fieldLimits[fieldName]
            });

            if (!validation.valid) {
                errors[key] = validation.errors;
            } else {
                // Sanitize and store valid data
                validatedData[key] = this.sanitizeValue(value);
            }
        }

        return {
            valid: Object.keys(errors).length === 0,
            errors: errors,
            data: validatedData
        };
    }

    // Sanitize input value
    sanitizeValue(value) {
        if (typeof value !== 'string') return value;

        return value
            .trim()
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .replace(/\0/g, '') // Remove null bytes
            .slice(0, 2000); // Hard limit
    }

    // Validate file upload directory
    validateUploadPath(filePath) {
        const uploadDir = path.resolve('./uploads');
        const resolvedPath = path.resolve(filePath);
        
        // Ensure file is within upload directory (prevent path traversal)
        if (!resolvedPath.startsWith(uploadDir)) {
            return {
                valid: false,
                error: 'Invalid upload path - potential directory traversal attack'
            };
        }

        return { valid: true };
    }
}

module.exports = new InputValidator();