import api from './api';

export const getHouseholdDetails = async () => {
    const response = await api.get('/households');
    return response.data;
};

export const updateHouseholdName = async (name) => {
    const response = await api.put('/households', { name });
    return response.data;
};

export const generateInviteCode = async () => {
    const response = await api.post('/households/invite');
    return response.data;
};

export const joinHousehold = async (inviteCode) => {
    const response = await api.post('/households/join', { inviteCode });
    return response.data;
};

export const removeMember = async (userId) => {
    const response = await api.delete(`/households/members/${userId}`);
    return response.data;
};
