// DEPRECATED: This file is kept for backward compatibility.
// Please use the RTK Query hooks from 'services/api/authApiSlice' instead.

import {
    useLoginMutation,
    useRegisterMutation,
    useGetCurrentUserQuery,
    useUpdateProfileMutation,
    logout
} from './api/authApiSlice';

// These functions wrap the RTK Query hooks to maintain the same API
export const login = async (credentials) => {
    try {
        const [loginMutation] = useLoginMutation();
        const response = await loginMutation(credentials).unwrap();
        return response;
    } catch (error) {
        console.error('Login service error:', error);
        throw error;
    }
};

export const register = async (userData) => {
    try {
        const [registerMutation] = useRegisterMutation();
        const response = await registerMutation(userData).unwrap();
        return response;
    } catch (error) {
        console.error('Register service error:', error);
        throw error;
    }
};

// Re-export logout function
export { logout };

export const getCurrentUser = async () => {
    try {
        const { data, error } = useGetCurrentUserQuery();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Get current user error:', error);
        throw error;
    }
};

export const updateProfile = async (userData) => {
    try {
        const [updateProfileMutation] = useUpdateProfileMutation();
        const response = await updateProfileMutation(userData).unwrap();
        return response;
    } catch (error) {
        console.error('Update profile error:', error);
        throw error;
    }
};

// Note: This file's approach won't work correctly outside React components.
// It's recommended to use the hooks directly in components.
