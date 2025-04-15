const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

// Gallery API configuration
const GALLERY_API_URL = 'https://gallery.tccs.tech/api/images';
const API_KEY = process.env.GALLERY_API_KEY || 'your_api_key_here'; // Store this in .env

// We still need temporary storage for multer to process uploads
const tempUploadsDir = path.join(__dirname, '../temp-uploads');
if (!fs.existsSync(tempUploadsDir)) {
    fs.mkdirSync(tempUploadsDir, { recursive: true });
}

// Use temporary disk storage before sending to external gallery
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, tempUploadsDir);
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

// Helper function to upload file to external gallery
const uploadToGallery = async (filePath, originalName, recipeId) => {
    console.log('Uploading to gallery:', filePath, originalName, 'for recipe:', recipeId);
    try {
        const formData = new FormData();
        formData.append('image', fs.createReadStream(filePath), originalName);
        formData.append('folder', 'family-kitchen');

        const response = await axios.post(GALLERY_API_URL, formData, {
            headers: {
                'X-API-KEY': API_KEY,
                ...formData.getHeaders()
            }
        });

        // Clean up temporary file
        fs.unlinkSync(filePath);
    

        // Update the recipe's image status to success
        if (recipeId) {
            const Recipe = require('../models/Recipe');
            await Recipe.findByIdAndUpdate(recipeId, {
                'image.status': 'success',
                'image.url': response.data.image.url,
                'image.id': response.data.image.id,
                'image.filename': response.data.image.filename
            });
        }

        return response.data;
    } catch (error) {
        console.error('Error uploading to gallery:', error.message);

        // Update the recipe's image status to failed
        if (recipeId) {
            const Recipe = require('../models/Recipe');
            await Recipe.findByIdAndUpdate(recipeId, {
                'image.status': 'failed'
            });
        }

        throw new Error('Failed to upload image to gallery');
    }
};

// Store pending uploads to process them later
const pendingUploads = new Map();

// Function to process a pending upload with recipe ID
const processPendingUpload = async (recipeId) => {
    if (pendingUploads.has(recipeId)) {
        const fileInfo = pendingUploads.get(recipeId);
        console.log(`Processing pending upload for recipe ${recipeId}`);

        try {
            await uploadToGallery(fileInfo.path, fileInfo.originalname, recipeId);
            pendingUploads.delete(recipeId);
            return true;
        } catch (error) {
            console.error(`Failed to process pending upload for recipe ${recipeId}:`, error);
            pendingUploads.delete(recipeId);
            return false;
        }
    }
    return false;
};

// Modified middleware to handle uploading to external gallery
const handleUpload = (fieldName) => {
    return (req, res, next) => {
        upload.single(fieldName)(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }

            if (!req.file) {
                return next();
            }

            try {
                // Generate a temporary URL for the file (accessible within the server)
                const tempUrl = `/temp-uploads/${req.file.filename}`;

                // Store temporary file info
                req.file.tempData = {
                    url: tempUrl,
                    filename: req.file.filename,
                    mimetype: req.file.mimetype,
                    size: req.file.size,
                    status: 'pending'
                };

                // Store file info for later processing
                const tempId = Date.now().toString();
                pendingUploads.set(tempId, {
                    path: req.file.path,
                    originalname: req.file.originalname
                });

                // Store the temp ID to link with recipe later
                req.file.tempId = tempId;

                next();
            } catch (error) {
                console.error('Error in file upload middleware:', error);
                return res.status(500).json({ error: error.message });
            }
        });
    };
};

// Helper to get public URL for an image
const getImageUrl = (filename) => {
    return `${GALLERY_API_URL}/${filename}`;
};

// Helper to delete an image from gallery
const deleteImage = async (filename) => {
    try {
        await axios.delete(`${GALLERY_API_URL}/family-kitchen/${filename}`, {
            headers: {
                'X-API-KEY': API_KEY
            }
        });
        return true;
    } catch (error) {
        console.error('Error deleting from gallery:', error.message);
        return false;
    }
};

module.exports = {
    handleUpload,
    getImageUrl,
    deleteImage,
    processPendingUpload,
    pendingUploads  // Export the pendingUploads Map
};
