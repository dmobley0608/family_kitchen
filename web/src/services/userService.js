import api from './api';

export const getUserProfile = async () => {
    const response = await api.get('/users/me');
    return response.data;
};

export const updateProfile = async (userData) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
};

export const changePassword = async (passwordData) => {
    const response = await api.put('/users/password', passwordData);
    return response.data;
};

export const getHouseholdMembers = async () => {
    const response = await api.get('/users/household-members');
    return response.data;
};

//  forgot password request method
export const forgotPassword = async (email) => {
    const response = await api.post('/auth/forgotpassword', { email });
    return response.data;
};

// reset password method
export const resetPassword = async (resettoken, password) => {
    const response = await api.put(`/auth/resetpassword/${resettoken}`, { password });
    return response.data;
};

//Remove Account
export const removeAccount = async () => {
    const response = await api.delete('/users/remove');
    return response.data;
};
