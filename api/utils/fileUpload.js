const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist for local storage
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Use local disk storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `recipe-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// Filter files to only allow images - fixed to correctly check MIME types
const fileFilter = (req, file, cb) => {
    // Check file extension
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
    const fileExt = path.extname(file.originalname).toLowerCase();

    // Check MIME type
    const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

    if (validExtensions.includes(fileExt) && validMimeTypes.includes(file.mimetype)) {
        return cb(null, true);
    }

    console.log(`Rejected file: ${file.originalname} (${file.mimetype})`);
    cb(new Error('Only image files (JPG, PNG, GIF) are allowed!'), false);
};

// Configure multer with the storage
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB file size limit
    },
    fileFilter
});

// Helper to get public URL for an image
const getImageUrl = (filename) => {
    return `/uploads/${filename}`;
};

module.exports = { upload, getImageUrl };
