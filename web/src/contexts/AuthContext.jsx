import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    useLoginMutation,
    useRegisterMutation,
    useGetCurrentUserQuery,
    useUpdateProfileMutation,
    logout as logoutAction
} from '../services/api/authApiSlice';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Use the RTK Query hooks
    const [loginMutation] = useLoginMutation();
    const [registerMutation] = useRegisterMutation();
    const [updateProfileMutation] = useUpdateProfileMutation();

    // For getting user data, we'll use the query with skipToken to control when it runs
    const { data: userData, error, refetch } = useGetCurrentUserQuery(undefined, {
        skip: !localStorage.getItem('token'),
    });

    // Update auth state when user data changes
    useEffect(() => {
        if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, [userData]);

    // Check token and load user data on app start
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsLoading(false);
            return;
        }

        // Token exists, refetch user data
        refetch()
            .catch(err => {
                console.error('Error loading user data:', err);
                setIsLoading(false);
            });
    }, [refetch]);

    // Auth methods
    const login = async (credentials) => {
        try {
            const data = await loginMutation(credentials).unwrap();
            setUser(data.user);
            setIsAuthenticated(true);
            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const data = await registerMutation(userData).unwrap();
            setUser(data.user);
            setIsAuthenticated(true);
            return data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    };

    const logout = () => {
        logoutAction();
        setUser(null);
        setIsAuthenticated(false);
    };

    const updateProfile = async (userData) => {
        try {
            const data = await updateProfileMutation(userData).unwrap();
            setUser(data);
            return data;
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    };

    const value = {
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        updateProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
