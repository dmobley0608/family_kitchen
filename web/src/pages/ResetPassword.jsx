import { useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
    Box, Button, TextField, Typography,
    Link, Alert, CircularProgress
} from '@mui/material';
import { useResetPasswordMutation } from '../services/api/userApiSlice';

const validationSchema = Yup.object({
    password: Yup.string()
        .min(6, 'Password should be at least 6 characters')
        .required('Password is required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm password is required'),
});

const ResetPassword = () => {
    const { resettoken } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState({ type: '', message: '' });

    const [resetPassword, { isLoading }] = useResetPasswordMutation();

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            setStatus({ type: '', message: '' });

            await resetPassword({
                token: resettoken,
                password: values.password
            }).unwrap();

            setStatus({
                type: 'success',
                message: 'Password has been reset successfully!'
            });

            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setStatus({
                type: 'error',
                message: err.data?.message || 'Failed to reset password. Please try again.'
            });
            setSubmitting(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
                Reset Password
            </Typography>

            <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
                Enter your new password below.
            </Typography>

            {status.message && (
                <Alert severity={status.type} sx={{ width: '100%', mb: 2 }}>
                    {status.message}
                </Alert>
            )}

            <Formik
                initialValues={{ password: '', confirmPassword: '' }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ errors, touched, isSubmitting }) => (
                    <Form style={{ width: '100%' }}>
                        <Field
                            as={TextField}
                            fullWidth
                            margin="normal"
                            id="password"
                            name="password"
                            label="New Password"
                            type="password"
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
                            disabled={isSubmitting || isLoading}
                            sx={{ mt: 3, mb: 2, py: 1.5 }}
                        >
                            {isSubmitting || isLoading ? <CircularProgress size={24} /> : 'Reset Password'}
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

export default ResetPassword;
