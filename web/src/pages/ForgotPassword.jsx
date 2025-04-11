import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
    Box, Button, TextField, Typography,
    Link, Alert, CircularProgress
} from '@mui/material';
import { forgotPassword } from '../services/userService';

const validationSchema = Yup.object({
    email: Yup.string()
        .email('Enter a valid email')
        .required('Email is required'),
});

const ForgotPassword = () => {
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            setStatus({ type: '', message: '' });

            await forgotPassword(values.email);

            setStatus({
                type: 'success',
                message: 'Password reset email sent! Please check your inbox.'
            });
            resetForm();
        } catch (err) {
            setStatus({
                type: 'error',
                message: err.response?.data?.message || 'Failed to send reset email. Please try again.'
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
                Forgot Password
            </Typography>

            <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
                Enter your email address and we'll send you a link to reset your password.
            </Typography>

            {status.message && (
                <Alert severity={status.type} sx={{ width: '100%', mb: 2 }}>
                    {status.message}
                </Alert>
            )}

            <Formik
                initialValues={{ email: '' }}
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

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            disabled={isSubmitting}
                            sx={{ mt: 3, mb: 2, py: 1.5 }}
                        >
                            {isSubmitting ? <CircularProgress size={24} /> : 'Send Reset Link'}
                        </Button>

                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                            <Typography variant="body2">
                                <Link component={RouterLink} to="/login" variant="body2">
                                    Back to Login
                                </Link>
                            </Typography>
                        </Box>
                    </Form>
                )}
            </Formik>
        </Box>
    );
};

export default ForgotPassword;
