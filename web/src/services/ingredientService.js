import api from './api';

export const getAllIngredients = async () => {
    const response = await api.get('/ingredients');
    return response.data;
};

export const getIngredientById = async (id) => {
    const response = await api.get(`/ingredients/${id}`);
    return response.data;
};

export const createIngredient = async (ingredientData) => {
    const response = await api.post('/ingredients', ingredientData);
    return response.data;
};
