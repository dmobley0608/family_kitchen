import { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
    Box, Typography, Paper, TextField, Button,
    Grid, Divider, CircularProgress, Alert,
    Tabs, Tab, Avatar, Dialog, DialogActions,
    DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import { Person, Lock, DeleteOutline } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    useUpdateUserProfileMutation,
    useChangePasswordMutation,
    useDeleteAccountMutation
} from '../services/api/userApiSlice';

// Validation schemas
const profileSchema = Yup.object().shape({
    name: Yup.string()
        .required('Name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name cannot exceed 50 characters'),
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required')
});

const passwordSchema = Yup.object().shape({
    currentPassword: Yup.string()
        .required('Current password is required'),
    newPassword: Yup.string()
        .required('New password is required')
        .min(6, 'Password must be at least 6 characters'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
        .required('Please confirm your password')
});

const ProfileSettings = () => {
    const { user, updateUser, logout } = useAuth();
    const navigate = useNavigate();

    // Use RTK Query hooks
    const [updateProfile, { isLoading: isUpdating }] = useUpdateUserProfileMutation();
    const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
    const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [tabValue, setTabValue] = useState(0);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState('');
    const [deleteError, setDeleteError] = useState('');

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        setError('');
        setSuccess('');
    };

    const handleProfileUpdate = async (values, { setSubmitting }) => {
        try {
            setError('');
            setSuccess('');

            // Use RTK Query mutation
            const updatedUser = await updateProfile({
                name: values.name,
                email: values.email
            }).unwrap();

            updateUser(updatedUser);
            setSuccess('Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            setError(error.data?.message || 'Failed to update profile');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePasswordChange = async (values, { setSubmitting, resetForm }) => {
        try {
            setError('');
            setSuccess('');

            // Use RTK Query mutation
            await changePassword({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword
            }).unwrap();

            setSuccess('Password changed successfully');
            resetForm();
        } catch (error) {
            console.error('Error changing password:', error);
            setError(error.data?.message || 'Failed to change password');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (confirmDelete !== 'DELETE') {
            setDeleteError('Please type DELETE to confirm account removal');
            return;
        }

        try {
            setDeleteError('');

            // Use RTK Query mutation
            await deleteAccount().unwrap();

            // Clear user data and redirect to home/login
            logout();
            navigate('/');
        } catch (error) {
            console.error('Error removing account:', error);
            setDeleteError(error.data?.message || 'Failed to remove account');
        }
    };

    if (!user) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Profile Settings
            </Typography>

            <Paper elevation={2} sx={{ p: 3 }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    aria-label="profile settings tabs"
                    sx={{ mb: 3 }}
                >
                    <Tab icon={<Person />} label="PROFILE" />
                    <Tab icon={<Lock />} label="PASSWORD" />
                </Tabs>

                {/* Profile Tab */}
                {tabValue === 0 && (
                    <Box>
                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                            <Avatar
                                sx={{
                                    width: 100,
                                    height: 100,
                                    fontSize: 40,
                                    bgcolor: 'primary.main'
                                }}
                            >
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </Avatar>
                        </Box>

                        <Formik
                            initialValues={{
                                name: user.name || '',
                                email: user.email || ''
                            }}
                            validationSchema={profileSchema}
                            onSubmit={handleProfileUpdate}
                        >
                            {({ isSubmitting, errors, touched }) => (
                                <Form>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <Field
                                                as={TextField}
                                                fullWidth
                                                label="Full Name"
                                                name="name"
                                                variant="outlined"
                                                error={touched.name && Boolean(errors.name)}
                                                helperText={touched.name && errors.name}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Field
                                                as={TextField}
                                                fullWidth
                                                label="Email Address"
                                                name="email"
                                                type="email"
                                                variant="outlined"
                                                error={touched.email && Boolean(errors.email)}
                                                helperText={touched.email && errors.email}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                color="primary"
                                                disabled={isSubmitting || isUpdating}
                                                sx={{ mt: 2 }}
                                            >
                                                {(isSubmitting || isUpdating) ? (
                                                    <CircularProgress size={24} />
                                                ) : (
                                                    'Update Profile'
                                                )}
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Form>
                            )}
                        </Formik>
                    </Box>
                )}

                {/* Password Tab */}
                {tabValue === 1 && (
                    <Box>
                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                        <Typography variant="body1" paragraph>
                            Use the form below to change your password.
                        </Typography>

                        <Formik
                            initialValues={{
                                currentPassword: '',
                                newPassword: '',
                                confirmPassword: ''
                            }}
                            validationSchema={passwordSchema}
                            onSubmit={handlePasswordChange}
                        >
                            {({ isSubmitting, errors, touched }) => (
                                <Form>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <Field
                                                as={TextField}
                                                fullWidth
                                                label="Current Password"
                                                name="currentPassword"
                                                type="password"
                                                variant="outlined"
                                                error={touched.currentPassword && Boolean(errors.currentPassword)}
                                                helperText={touched.currentPassword && errors.currentPassword}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Divider sx={{ my: 1 }} />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Field
                                                as={TextField}
                                                fullWidth
                                                label="New Password"
                                                name="newPassword"
                                                type="password"
                                                variant="outlined"
                                                error={touched.newPassword && Boolean(errors.newPassword)}
                                                helperText={touched.newPassword && errors.newPassword}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Field
                                                as={TextField}
                                                fullWidth
                                                label="Confirm New Password"
                                                name="confirmPassword"
                                                type="password"
                                                variant="outlined"
                                                error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                                                helperText={touched.confirmPassword && errors.confirmPassword}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                color="primary"
                                                disabled={isSubmitting || isChangingPassword}
                                                sx={{ mt: 2 }}
                                            >
                                                {(isSubmitting || isChangingPassword) ? (
                                                    <CircularProgress size={24} />
                                                ) : (
                                                    'Change Password'
                                                )}
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Form>
                            )}
                        </Formik>
                    </Box>
                )}

                {/* Account Removal Section - shown on both tabs */}
                <Box sx={{ mt: 6, pt: 4, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
                    <Typography variant="h6" color="error" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <DeleteOutline sx={{ mr: 1 }} />
                        Remove Account
                    </Typography>
                    <Typography variant="body2" paragraph>
                        Once you delete your account, there is no going back. This action cannot be undone.
                    </Typography>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={() => setDeleteDialogOpen(true)}
                        startIcon={<DeleteOutline />}
                    >
                        Delete My Account
                    </Button>
                </Box>
            </Paper>

            {/* Delete Account Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => {
                    setDeleteDialogOpen(false);
                    setConfirmDelete('');
                    setDeleteError('');
                }}
            >
                <DialogTitle color="error">Delete Account?</DialogTitle>
                <DialogContent>
                    <DialogContentText paragraph>
                        Are you sure you want to delete your account? All of your data will be permanently removed.
                        This action cannot be undone.
                    </DialogContentText>

                    <DialogContentText paragraph>
                        Please type <strong>DELETE</strong> to confirm:
                    </DialogContentText>

                    <TextField
                        fullWidth
                        value={confirmDelete}
                        onChange={(e) => setConfirmDelete(e.target.value)}
                        error={!!deleteError}
                        helperText={deleteError}
                        variant="outlined"
                        margin="dense"
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setDeleteDialogOpen(false);
                            setConfirmDelete('');
                            setDeleteError('');
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteAccount}
                        color="error"
                        disabled={isDeleting}
                        startIcon={isDeleting ? <CircularProgress size={20} /> : null}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete Forever'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProfileSettings;
