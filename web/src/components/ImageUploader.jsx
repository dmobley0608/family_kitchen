import React, { useState, useEffect } from 'react';
import {
    Box, Button, Typography, CircularProgress,
    IconButton, Card, CardMedia, Stack
} from '@mui/material';
import { PhotoCamera, Delete } from '@mui/icons-material';
import { getImageUrl } from '../utils/tools';


const ImageUploader = ({ value, onChange, error }) => {
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);

    // Create a preview when a file is selected
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);

        // File type validation
        if (!file.type.match('image.*')) {
            onChange(null, 'Please select an image file');
            setLoading(false);
            return;
        }

        // File size validation (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            onChange(null, 'Image size must be less than 5MB');
            setLoading(false);
            return;
        }

        // Create a preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
            setLoading(false);
            onChange(file);
        };
        reader.readAsDataURL(file);
    };

    // Remove the current image
    const handleRemoveImage = () => {
        setPreview(null);
        onChange(null);
    };

    // Set the preview if we have a URL string (existing image)
    useEffect(() => {
        if (value) {
            if (typeof value === 'string') {
                // This is an existing image URL
                setPreview(value);
            } else if (value instanceof File) {
                // This is a new file being uploaded
                const reader = new FileReader();
                reader.onloadend = () => setPreview(reader.result);
                reader.readAsDataURL(value);
            }
        } else {
            setPreview(null);
        }
    }, [value]);

    return (
        <Box>
            <Typography variant="subtitle1" gutterBottom>
                Recipe Image
            </Typography>

            {preview ? (
                <Box sx={{ mb: 2 }}>
                    <Card sx={{ position: 'relative', maxWidth: 400, mx: 'auto' }}>
                        <CardMedia
                            component="img"
                            height="250"
                            image={preview}
                            alt="Recipe preview"
                            sx={{ objectFit: 'cover' }}
                        />
                        <IconButton
                            sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                }
                            }}
                            onClick={handleRemoveImage}
                        >
                            <Delete sx={{ color: 'white' }} />
                        </IconButton>
                    </Card>

                    <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
                        <input
                            type="file"
                            accept="image/*"
                            id="recipe-image-change"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                        <label htmlFor="recipe-image-change">
                            <Button
                                variant="outlined"
                                component="span"
                                startIcon={<PhotoCamera />}
                                disabled={loading}
                            >
                                Change Image
                            </Button>
                        </label>
                    </Stack>
                </Box>
            ) : (
                <Box
                    sx={{
                        border: error ? '1px dashed #d32f2f' : '1px dashed #ccc',
                        borderRadius: 1,
                        p: 4,
                        textAlign: 'center',
                        mb: 2,
                        backgroundColor: error ? 'rgba(211, 47, 47, 0.04)' : 'transparent'
                    }}
                >
                    {loading ? (
                        <CircularProgress size={24} />
                    ) : (
                        <>
                            <PhotoCamera sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Upload a photo of your dish
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                                JPG, PNG or GIF • Max 5MB
                            </Typography>

                            <input
                                type="file"
                                accept="image/*"
                                id="recipe-image-upload"
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                            />
                            <label htmlFor="recipe-image-upload">
                                <Button
                                    variant="outlined"
                                    component="span"
                                    startIcon={<PhotoCamera />}
                                    sx={{ mt: 2 }}
                                >
                                    Select Image
                                </Button>
                            </label>
                        </>
                    )}
                </Box>
            )}

            {error && (
                <Typography variant="caption" color="error" display="block" sx={{ mt: 1 }}>
                    {error}
                </Typography>
            )}
        </Box>
    );
};

export default ImageUploader;
