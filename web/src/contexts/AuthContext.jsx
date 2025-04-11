import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../services/authService';
import * as invitationService from '../services/invitationService';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const navigate = useNavigate();

    // Set authorization header on token change
    useEffect(() => {
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete api.defaults.headers.common['Authorization'];
        }
    }, [token]);

    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                try {
                    const userData = await authService.getCurrentUser();
                    setUser(userData.user);
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error('Auth initialization failed:', error);
                    localStorage.removeItem('token');
                    setToken(null);
                    setIsAuthenticated(false);
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, [token]);

    const login = async (email, password) => {
        try {
            setIsLoading(true);

            // Ensure we're sending proper credentials
            const response = await authService.login({
                email,
                password
            });

            if (response && response.token) {
                localStorage.setItem('token', response.token);
                setToken(response.token);
                setUser(response.user);
                setIsAuthenticated(true);

                // Process pending invitation if exists
                const pendingInvitation = sessionStorage.getItem('pendingInvitation');
                if (pendingInvitation) {
                    try {
                        sessionStorage.removeItem('pendingInvitation');
                        await invitationService.acceptInvitation(pendingInvitation);
                    } catch (inviteError) {
                        console.error('Failed to accept pending invitation:', inviteError);
                    }
                }

                return response;
            } else {
                throw new Error('Invalid response from server - no token received');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData) => {
        try {
            setIsLoading(true);
            const response = await authService.register(userData);

            if (response && response.token) {
                localStorage.setItem('token', response.token);
                setToken(response.token);
                setUser(response.user);
                setIsAuthenticated(true);
                return response.user;
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        delete api.defaults.headers.common['Authorization'];
        navigate('/login');
    };

    const updateUser = (userData) => {
        setUser(prevUser => {
            if (!prevUser) return userData;
            return { ...prevUser, ...userData };
        });
        setIsAuthenticated(true);
    };

    const value = {
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        updateUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
