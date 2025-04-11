import api from './api';

export const sendInvitation = async (email) => {
    try {
        const response = await api.post('/invitations', { email });
        return response.data;
    } catch (error) {
        console.error('Send invitation error:', error);
        throw error;
    }
};

export const verifyInvitation = async (token) => {
    try {
        const response = await api.get(`/invitations/verify/${token}`);
        return response.data;
    } catch (error) {
        console.error('Verify invitation error:', error);
        throw error;
    }
};

export const acceptInvitation = async (token) => {
    try {
        // Always send with an empty object to avoid JSON parsing issues
        const response = await api.post(`/invitations/accept/${token}`, {});
        return response.data;
    } catch (error) {
        console.error('Accept invitation error:', error);
        throw error;
    }
};

export const getUserInvitations = async () => {
    try {
        const response = await api.get('/invitations/sent');
        return response.data;
    } catch (error) {
        console.error('Get invitations error:', error);
        throw error;
    }
};

export const resendInvitation = async (invitationId) => {
    try {
        const response = await api.post(`/invitations/resend/${invitationId}`, {});
        return response.data;
    } catch (error) {
        console.error('Resend invitation error:', error);
        throw error;
    }
};
