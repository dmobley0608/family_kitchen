import api from './api';

export const getAllCategories = async () => {
    const response = await api.get('/categories');
    return response.data;
};

export const getCategoryById = async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
};

export const createCategory = async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
};
