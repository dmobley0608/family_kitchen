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
    name: Yup.string()
        .required('Name is required'),
    email: Yup.string()
        .email('Enter a valid email')
        .required('Email is required'),
    password: Yup.string()
        .min(6, 'Password should be at least 6 characters')
        .required('Password is required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm your password'),
});

const Register = () => {
    const { register } = useAuth();
    const [error, setError] = useState('');

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            setError('');
            const { confirmPassword, ...registrationData } = values;
            await register(registrationData);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register. Please try again.');
            setSubmitting(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
                Create an Account
            </Typography>

            {error && (
                <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Formik
                initialValues={{ name: '', email: '', password: '', confirmPassword: '' }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ errors, touched, isSubmitting }) => (
                    <Form style={{ width: '100%' }}>
                        <Field
                            as={TextField}
                            fullWidth
                            margin="normal"
                            id="name"
                            name="name"
                            label="Full Name"
                            autoComplete="name"
                            error={touched.name && Boolean(errors.name)}
                            helperText={touched.name && errors.name}
                        />

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
                            autoComplete="new-password"
                            error={touched.password && Boolean(errors.password)}
                            helperText={touched.password && errors.password}
                        />

                        <Field
                            as={TextField}
                            fullWidth
                            margin="normal"
                            id="confirmPassword"
                            name="confirmPassword"
                            label="Confirm Password"
                            type="password"
                            error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                            helperText={touched.confirmPassword && errors.confirmPassword}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            disabled={isSubmitting}
                            sx={{ mt: 3, mb: 2, py: 1.5 }}
                        >
                            {isSubmitting ? <CircularProgress size={24} /> : 'Register'}
                        </Button>

                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                            <Typography variant="body2">
                                Already have an account?{' '}
                                <Link component={RouterLink} to="/login" variant="body2">
                                    Login
                                </Link>
                            </Typography>
                        </Box>
                    </Form>
                )}
            </Formik>
        </Box>
    );
};

export default Register;
