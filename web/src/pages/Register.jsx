import { useEffect, useState, useRef } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    Box, Button, TextField, Typography,
    Link, Alert, CircularProgress
} from '@mui/material';
import { useRegisterMutation } from '../services/api/authApiSlice';

const Register = () => {
    const navigate = useNavigate();
    // Use RTK Query register mutation
    const [registerUser, { isLoading, isError, error: registerError }] = useRegisterMutation();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');
    const errorRef = useRef(null);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear field-specific error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Validate form data
    const validateForm = () => {
        const newErrors = {};

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        // Email validation
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email address is invalid';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password should be at least 6 characters';
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords must match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form before submission
        if (!validateForm()) {
            return;
        }

        try {
            const { confirmPassword, ...registrationData } = formData;

            // Use RTK Query register mutation
            const result = await registerUser(registrationData).unwrap();

            // On success, redirect to login or home page
            navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
        } catch (err) {
            console.error('Registration error:', err);
            setApiError(err.data?.message || 'Registration failed. Please try again.');
        }
    };

    // Get all visible error messages for summary display
    const getErrorMessages = () => {
        const messages = [];
        Object.values(errors).forEach(error => {
            if (error) messages.push(error);
        });
        return messages;
    };

    useEffect(() => {
        if (apiError) {
            errorRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [apiError]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            {/* API Error Alert */}
            {apiError && (
                <Alert
                    ref={errorRef}
                    severity="error"
                    variant="filled"
                    sx={{
                        width: '100%',
                        mb: 3,
                        borderRadius: 1,
                        boxShadow: 3,
                        '& .MuiAlert-message': {
                            fontWeight: 600,
                            fontSize: '0.95rem',
                        },
                    }}
                >
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            Registration Failed
                        </Typography>
                        <Typography variant="body2">{apiError}</Typography>

                        {apiError === 'User already exists' && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                Please <Link component={RouterLink} to="/login" sx={{ color: 'white', fontWeight: 'bold', textDecoration: 'underline' }}>
                                    log in
                                </Link> instead or use a different email address.
                            </Typography>
                        )}
                    </Box>
                </Alert>
            )}

            <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
                Create an Account
            </Typography>

            {/* Validation Errors Summary */}
            {getErrorMessages().length > 0 && (
                <Alert
                    severity="warning"
                    sx={{
                        mb: 2,
                        width: '100%',
                        '& .MuiAlert-message': { fontWeight: 500 }
                    }}
                >
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Please fix the following errors:
                    </Typography>
                    <Box component="ul" sx={{ m: 0, pl: 2 }}>
                        {getErrorMessages().map((msg, idx) => (
                            <Box component="li" key={idx} sx={{ mb: 0.5 }}>
                                {msg}
                            </Box>
                        ))}
                    </Box>
                </Alert>
            )}

            {/* Registration Form */}
            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                <TextField
                    fullWidth
                    margin="normal"
                    id="name"
                    name="name"
                    label="Full Name"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={Boolean(errors.name)}
                    helperText={errors.name}
                />

                <TextField
                    fullWidth
                    margin="normal"
                    id="email"
                    name="email"
                    label="Email Address"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={Boolean(errors.email)}
                    helperText={errors.email}
                />

                <TextField
                    fullWidth
                    margin="normal"
                    id="password"
                    name="password"
                    label="Password"
                    type="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    error={Boolean(errors.password)}
                    helperText={errors.password}
                />

                <TextField
                    fullWidth
                    margin="normal"
                    id="confirmPassword"
                    name="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={Boolean(errors.confirmPassword)}
                    helperText={errors.confirmPassword}
                />

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    disabled={isLoading}
                    sx={{ mt: 3, mb: 2, py: 1.5 }}
                >
                    {isLoading ? <CircularProgress size={24} /> : 'Register'}
                </Button>

                <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Typography variant="body2">
                        Already have an account?{' '}
                        <Link component={RouterLink} to="/login" variant="body2">
                            Login
                        </Link>
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default Register;
