export const getImageUrl = (imagePath) => {
        return `${imagePath}?key=${import.meta.env.VITE_GALLERY_API_KEY}`;
    };