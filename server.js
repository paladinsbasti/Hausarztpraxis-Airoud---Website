const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'hausarzt-cms-secret-key';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Admin user (in production, this would be in a database with hashed passwords)
const adminUser = {
    username: 'admin',
    password: 'hausarzt2024!' // Temporär im Klartext für Debugging
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Create uploads directory if it doesn't exist
const createUploadDir = async () => {
    try {
        await fs.mkdir('uploads', { recursive: true });
        await fs.mkdir('backups', { recursive: true });
        await fs.mkdir('data', { recursive: true });
    } catch (error) {
        console.error('Error creating directories:', error);
    }
};

// Initialize server
createUploadDir();

// Authentication Routes

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        if (username !== adminUser.username) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Temporäre Klartext-Verifikation für Debugging
        if (password !== adminUser.password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { username: adminUser.username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ 
            token,
            message: 'Login successful',
            expiresIn: '24h'
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Verify token endpoint
app.get('/api/auth/verify', authenticateToken, (req, res) => {
    res.json({ valid: true, user: req.user });
});

// Content Management Routes

// Get current translations
app.get('/api/translations', (req, res) => {
    try {
        const translationsPath = path.join(__dirname, 'translations.js');
        fs.readFile(translationsPath, 'utf8').then(data => {
            // Extract the translations object from the file
            const match = data.match(/const translations = ({[\s\S]*});/);
            if (match) {
                const translations = JSON.parse(match[1]);
                res.json(translations);
            } else {
                res.status(500).json({ error: 'Could not parse translations file' });
            }
        }).catch(error => {
            console.error('Error reading translations:', error);
            res.status(500).json({ error: 'Error reading translations file' });
        });
    } catch (error) {
        console.error('Error getting translations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Save translations
app.post('/api/translations', authenticateToken, async (req, res) => {
    try {
        const { translations } = req.body;

        if (!translations) {
            return res.status(400).json({ error: 'Translations data required' });
        }

        // Create backup of current translations
        const timestamp = new Date().toISOString();
        const backupFilename = `translations-backup-${timestamp.replace(/:/g, '-')}.js`;
        const backupPath = path.join(__dirname, 'backups', backupFilename);
        
        try {
            const currentContent = await fs.readFile('translations.js', 'utf8');
            await fs.writeFile(backupPath, currentContent);
        } catch (error) {
            console.warn('Could not create translation backup:', error);
        }

        // Generate new translations.js file
        const translationsContent = `// Translations for multi-language support
// Last updated: ${new Date().toLocaleString('de-DE')}
const translations = ${JSON.stringify(translations, null, 4)};`;

        await fs.writeFile('translations.js', translationsContent);

        // Save to data directory as JSON for easier API access
        await fs.writeFile(
            path.join(__dirname, 'data', 'translations.json'), 
            JSON.stringify(translations, null, 2)
        );

        res.json({ 
            message: 'Translations saved successfully',
            backup: backupFilename
        });
    } catch (error) {
        console.error('Error saving translations:', error);
        res.status(500).json({ error: 'Error saving translations' });
    }
});

// Get contact information
app.get('/api/contact', (req, res) => {
    try {
        fs.readFile(path.join(__dirname, 'data', 'contact.json'), 'utf8')
            .then(data => {
                res.json(JSON.parse(data));
            })
            .catch(() => {
                // Return default contact info if file doesn't exist
                res.json({
                    address: 'Eschenstr. 138\n42283 Wuppertal',
                    phone: '0202 25 350 880',
                    email: 'info@hausarztpraxis-airoud.de',
                    hours: {
                        monday: '08:30 - 13:00 | 16:00 - 18:00 Uhr',
                        tuesday: '08:30 - 13:00 | 16:00 - 18:00 Uhr',
                        wednesday: '08:30 - 13:00 Uhr',
                        thursday: '08:30 - 13:00 | 16:00 - 18:00 Uhr',
                        friday: '08:30 - 13:00 Uhr'
                    }
                });
            });
    } catch (error) {
        console.error('Error getting contact info:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Save contact information
app.post('/api/contact', authenticateToken, async (req, res) => {
    try {
        const contactData = req.body;
        
        await fs.writeFile(
            path.join(__dirname, 'data', 'contact.json'),
            JSON.stringify(contactData, null, 2)
        );

        res.json({ message: 'Contact information saved successfully' });
    } catch (error) {
        console.error('Error saving contact info:', error);
        res.status(500).json({ error: 'Error saving contact information' });
    }
});

// Image Management Routes

// Upload images
app.post('/api/images/upload', authenticateToken, upload.array('images', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No images uploaded' });
        }

        const uploadedImages = req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            url: `/uploads/${file.filename}`,
            size: file.size,
            uploadedAt: new Date().toISOString()
        }));

        // Save image metadata
        try {
            const existingImages = await fs.readFile(path.join(__dirname, 'data', 'images.json'), 'utf8')
                .then(data => JSON.parse(data))
                .catch(() => []);
            
            const updatedImages = [...existingImages, ...uploadedImages];
            await fs.writeFile(
                path.join(__dirname, 'data', 'images.json'),
                JSON.stringify(updatedImages, null, 2)
            );
        } catch (error) {
            console.warn('Error saving image metadata:', error);
        }

        res.json({
            message: 'Images uploaded successfully',
            images: uploadedImages
        });
    } catch (error) {
        console.error('Error uploading images:', error);
        res.status(500).json({ error: 'Error uploading images' });
    }
});

// Get all images
app.get('/api/images', (req, res) => {
    try {
        fs.readFile(path.join(__dirname, 'data', 'images.json'), 'utf8')
            .then(data => {
                res.json(JSON.parse(data));
            })
            .catch(() => {
                res.json([]);
            });
    } catch (error) {
        console.error('Error getting images:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete image
app.delete('/api/images/:filename', authenticateToken, async (req, res) => {
    try {
        const { filename } = req.params;
        
        // Delete physical file
        try {
            await fs.unlink(path.join(__dirname, 'uploads', filename));
        } catch (error) {
            console.warn('Error deleting physical file:', error);
        }

        // Update metadata
        try {
            const existingImages = await fs.readFile(path.join(__dirname, 'data', 'images.json'), 'utf8')
                .then(data => JSON.parse(data))
                .catch(() => []);
            
            const updatedImages = existingImages.filter(img => img.filename !== filename);
            await fs.writeFile(
                path.join(__dirname, 'data', 'images.json'),
                JSON.stringify(updatedImages, null, 2)
            );
        } catch (error) {
            console.warn('Error updating image metadata:', error);
        }

        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ error: 'Error deleting image' });
    }
});

// Backup Routes

// Create backup
app.post('/api/backup/create', authenticateToken, async (req, res) => {
    try {
        const timestamp = new Date().toISOString();
        const backupData = {
            timestamp,
            version: '1.0'
        };

        // Read current translations
        try {
            const translationsData = await fs.readFile(path.join(__dirname, 'data', 'translations.json'), 'utf8');
            backupData.translations = JSON.parse(translationsData);
        } catch (error) {
            console.warn('Could not backup translations:', error);
        }

        // Read contact info
        try {
            const contactData = await fs.readFile(path.join(__dirname, 'data', 'contact.json'), 'utf8');
            backupData.contact = JSON.parse(contactData);
        } catch (error) {
            console.warn('Could not backup contact info:', error);
        }

        // Read images metadata
        try {
            const imagesData = await fs.readFile(path.join(__dirname, 'data', 'images.json'), 'utf8');
            backupData.images = JSON.parse(imagesData);
        } catch (error) {
            console.warn('Could not backup images metadata:', error);
        }

        // Save backup
        const backupFilename = `backup-${timestamp.replace(/:/g, '-')}.json`;
        const backupPath = path.join(__dirname, 'backups', backupFilename);
        await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2));

        // Update backup history
        try {
            const historyPath = path.join(__dirname, 'data', 'backup-history.json');
            const history = await fs.readFile(historyPath, 'utf8')
                .then(data => JSON.parse(data))
                .catch(() => []);
            
            history.unshift({
                timestamp,
                filename: backupFilename,
                size: JSON.stringify(backupData).length
            });

            // Keep only last 20 backups
            if (history.length > 20) {
                history.splice(20);
            }

            await fs.writeFile(historyPath, JSON.stringify(history, null, 2));
        } catch (error) {
            console.warn('Error updating backup history:', error);
        }

        res.json({
            message: 'Backup created successfully',
            filename: backupFilename,
            timestamp
        });
    } catch (error) {
        console.error('Error creating backup:', error);
        res.status(500).json({ error: 'Error creating backup' });
    }
});

// Get backup history
app.get('/api/backup/history', authenticateToken, (req, res) => {
    try {
        fs.readFile(path.join(__dirname, 'data', 'backup-history.json'), 'utf8')
            .then(data => {
                res.json(JSON.parse(data));
            })
            .catch(() => {
                res.json([]);
            });
    } catch (error) {
        console.error('Error getting backup history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Download backup
app.get('/api/backup/download/:filename', authenticateToken, (req, res) => {
    try {
        const { filename } = req.params;
        const backupPath = path.join(__dirname, 'backups', filename);
        
        res.download(backupPath, filename, (error) => {
            if (error) {
                console.error('Error downloading backup:', error);
                res.status(404).json({ error: 'Backup file not found' });
            }
        });
    } catch (error) {
        console.error('Error downloading backup:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Restore backup
app.post('/api/backup/restore', authenticateToken, upload.single('backup'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No backup file uploaded' });
        }

        const backupContent = await fs.readFile(req.file.path, 'utf8');
        const backupData = JSON.parse(backupContent);

        // Restore translations
        if (backupData.translations) {
            await fs.writeFile(
                path.join(__dirname, 'data', 'translations.json'),
                JSON.stringify(backupData.translations, null, 2)
            );

            // Update translations.js file
            const translationsContent = `// Translations for multi-language support
// Restored from backup: ${new Date().toLocaleString('de-DE')}
const translations = ${JSON.stringify(backupData.translations, null, 4)};`;
            
            await fs.writeFile('translations.js', translationsContent);
        }

        // Restore contact info
        if (backupData.contact) {
            await fs.writeFile(
                path.join(__dirname, 'data', 'contact.json'),
                JSON.stringify(backupData.contact, null, 2)
            );
        }

        // Restore images metadata (images themselves would need to be uploaded separately)
        if (backupData.images) {
            await fs.writeFile(
                path.join(__dirname, 'data', 'images.json'),
                JSON.stringify(backupData.images, null, 2)
            );
        }

        // Clean up uploaded backup file
        try {
            await fs.unlink(req.file.path);
        } catch (error) {
            console.warn('Error cleaning up backup file:', error);
        }

        res.json({ 
            message: 'Backup restored successfully',
            restoredAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error restoring backup:', error);
        res.status(500).json({ error: 'Error restoring backup' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0'
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large' });
        }
    }
    
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 CMS Server running on http://localhost:${PORT}`);
    console.log(`📁 Admin interface: http://localhost:${PORT}/admin.html`);
    console.log(`🔐 Login: admin / hausarzt2024!`);
});

module.exports = app;
