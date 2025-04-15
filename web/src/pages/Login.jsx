import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
    Box, Button, TextField, Typography,
    Link, Alert, CircularProgress
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useLoginMutation } from '../services/api/authApiSlice';

const validationSchema = Yup.object({
    email: Yup.string()
        .email('Enter a valid email')
        .required('Email is required'),
    password: Yup.string()
        .min(6, 'Password should be at least 6 characters')
        .required('Password is required'),
});

const Login = () => {
    const auth = useAuth();
    const { updateUser } = auth;
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const [login, { isLoading }] = useLoginMutation();
    const [loginSuccess, setLoginSuccess] = useState(false);

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            setError('');
            const result = await login({
                email: values.email,
                password: values.password
            }).unwrap();

            if (updateUser) {
                updateUser(result.user);
            }

            if (typeof auth.setIsAuthenticated === 'function') {
                auth.setIsAuthenticated(true);
            } else if (typeof auth.login === 'function') {
                auth.login(result.user);
            } else if (typeof auth.authenticate === 'function') {
                auth.authenticate(true);
            } else {
                console.warn('No authentication method found in AuthContext');
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('user', JSON.stringify(result.user));
            }

            // Store the redirect URL in sessionStorage before reload
            const redirectTo = new URLSearchParams(location.search).get('redirect') || '/';
            sessionStorage.setItem('authRedirect', redirectTo);

            setLoginSuccess(true);

            // Don't navigate here, we'll handle it after reload
        } catch (err) {
            console.error('Login error:', err);
            setError(err.data?.message || 'Failed to login. Please try again.');
            setSubmitting(false);
        }
    };

    // Check for redirect on component mount
    useEffect(() => {
        const redirectUrl = sessionStorage.getItem('authRedirect');
        if (redirectUrl) {
            sessionStorage.removeItem('authRedirect');
            navigate(redirectUrl);
        }
    }, [navigate]);

    // Force reload after successful login
    useEffect(() => {
        if (loginSuccess) {
            // Immediate reload instead of waiting
            window.location.reload();
        }
    }, [loginSuccess]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
                Login to Your Account
            </Typography>

            {error && (
                <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Formik
                initialValues={{ email: '', password: '' }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ errors, touched, isSubmitting }) => (
                    <Form style={{ width: '100%' }}>
                        <Field
                            as={TextField}
                            fullWidth
                            margin="normal"
                            id="email"
                            name="email"
                            label="Email Address"
                            autoComplete="email"
                            error={touched.email && Boolean(errors.email)}
                            helperText={touched.email && errors.email}
                        />

                        <Field
                            as={TextField}
                            fullWidth
                            margin="normal"
                            id="password"
                            name="password"
                            label="Password"
                            type="password"
                            autoComplete="current-password"
                            error={touched.password && Boolean(errors.password)}
                            helperText={touched.password && errors.password}
                        />

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                            <Link component={RouterLink} to="/forgot-password" variant="body2">
                                Forgot password?
                            </Link>
                        </Box>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            disabled={isSubmitting || isLoading}
                            sx={{ mt: 2, mb: 2, py: 1.5 }}
                        >
                            {isSubmitting || isLoading ? <CircularProgress size={24} /> : 'Login'}
                        </Button>

                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                            <Typography variant="body2">
                                Don't have an account?{' '}
                                <Link component={RouterLink} to="/register" variant="body2">
                                    Sign Up
                                </Link>
                            </Typography>
                        </Box>
                    </Form>
                )}
            </Formik>
        </Box>
    );
};

export default Login;
