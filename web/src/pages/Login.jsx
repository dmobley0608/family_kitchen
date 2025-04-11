import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
    Box, Button, TextField, Typography,
    Link, Alert, CircularProgress
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const validationSchema = Yup.object({
    email: Yup.string()
        .email('Enter a valid email')
        .required('Email is required'),
    password: Yup.string()
        .min(6, 'Password should be at least 6 characters')
        .required('Password is required'),
});

const Login = () => {
    const { login } = useAuth();
    const [error, setError] = useState('');

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            setError('');
            console.log(values)
            await login(values.email, values.password);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to login. Please try again.');
            setSubmitting(false);
        }
    };

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
                            disabled={isSubmitting}
                            sx={{ mt: 2, mb: 2, py: 1.5 }}
                        >
                            {isSubmitting ? <CircularProgress size={24} /> : 'Login'}
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
