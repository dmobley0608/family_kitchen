import api from './api';

export const login = async (credentials) => {
    try {
        // Ensure we're sending a valid object
        const loginData = {
            email: credentials?.email || '',
            password: credentials?.password || ''
        };
     
        const response = await api.post('/auth/login', loginData);
        return response.data;
    } catch (error) {
        console.error('Login service error:', error);
        throw error;
    }
};

export const register = async (userData) => {
    try {
        const response = await api.post('/auth/register', userData);
        return response.data;
    } catch (error) {
        console.error('Register service error:', error);
        throw error;
    }
};

export const logout = () => {
    localStorage.removeItem('token');
};

export const getCurrentUser = async () => {
    try {
        const response = await api.get('/auth/me');
        return response.data;
    } catch (error) {
        console.error('Get current user error:', error);
        throw error;
    }
};

export const updateProfile = async (userData) => {
    try {
        const response = await api.put('/auth/update-profile', userData);
        return response.data;
    } catch (error) {
        console.error('Update profile error:', error);
        throw error;
    }
};
