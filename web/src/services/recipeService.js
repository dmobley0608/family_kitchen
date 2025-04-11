import api from './api';

export const getAllRecipes = async () => {
    const response = await api.get('/recipes');
    return response.data;
};

export const getRecipeById = async (id) => {
    const response = await api.get(`/recipes/${id}`);
    return response.data;
};

export const createRecipe = async (recipeData) => {
    const response = await api.post('/recipes', recipeData);
    return response.data;
};

export const updateRecipe = async (id, recipeData) => {
    // Use FormData for updates to handle file uploads
    const formData = new FormData();

    // Add recipe image if present and it's a File object
    if (recipeData.image instanceof File) {
        formData.append('image', recipeData.image);
    }

    // Convert nested objects and arrays to JSON strings
    for (const key in recipeData) {
        if (key === 'image') {
            // Skip if it's already appended as a File or is a URL string (unchanged image)
            if (recipeData[key] instanceof File) {
                continue;
            } else if (typeof recipeData[key] === 'string') {
                // Don't include URL string references in the form data,
                // only new files should be sent
                continue;
            } else if (recipeData[key] === null) {
                // If image is explicitly set to null, signal to remove the image
                formData.append('removeImage', 'true');
            }
        } else if (recipeData[key] !== null && typeof recipeData[key] === 'object') {
            // Convert objects and arrays to JSON strings
            formData.append(key, JSON.stringify(recipeData[key]));
        } else {
            // Add regular fields
            formData.append(key, recipeData[key]);
        }
    }

    const response = await api.put(`/recipes/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

    return response.data;
};

export const deleteRecipe = async (id) => {
    const response = await api.delete(`/recipes/${id}`);
    return response.data;
};
