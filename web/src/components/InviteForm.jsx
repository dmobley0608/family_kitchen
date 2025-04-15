import { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
    TextField, Button, Box, Dialog, DialogTitle,
    DialogContent, DialogActions, Typography,
    Alert, CircularProgress, IconButton
} from '@mui/material';
import {
    Send as SendIcon,
    ContentCopy as CopyIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useSendInvitationMutation } from '../services/api/invitationsApiSlice';

const inviteSchema = Yup.object().shape({
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required')
});

const InviteForm = ({ onInviteSuccess }) => {
    const [open, setOpen] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [inviteLink, setInviteLink] = useState('');
    const [copied, setCopied] = useState(false);

    // Use RTK Query mutation hook
    const [sendInvitation, { isLoading }] = useSendInvitationMutation();

    const handleOpen = () => {
        setOpen(true);
        setError('');
        setSuccess(false);
    };

    const handleClose = () => {
        if (!success || !inviteLink) {
            setOpen(false);
        } else {
            setTimeout(() => {
                setOpen(false);
            }, 1500);
        }
    };

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            setError('');

            // Use RTK Query mutation
            const response = await sendInvitation(values.email).unwrap();

            setSuccess(true);
            resetForm();

            if (response.inviteLink) {
                setInviteLink(response.inviteLink);
            }

            if (onInviteSuccess) {
                onInviteSuccess(response.invitation);
            }

            if (!response.inviteLink) {
                setTimeout(() => {
                    setOpen(false);
                    setSuccess(false);
                }, 1500);
            }
        } catch (err) {
            setError(err.data?.message || 'Failed to send invitation');
        } finally {
            setSubmitting(false);
        }
    };

    const copyToClipboard = () => {
        if (navigator.clipboard && inviteLink) {
            navigator.clipboard.writeText(inviteLink)
                .then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                })
                .catch(err => {
                    console.error('Failed to copy:', err);
                });
        }
    };

    return (
        <>
            <Button
                variant="outlined"
                color="primary"
                onClick={handleOpen}
                startIcon={<SendIcon />}
            >
                Invite Member
            </Button>

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <Formik
                    initialValues={{ email: '' }}
                    validationSchema={inviteSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting, errors, touched }) => (
                        <Form>
                            <DialogTitle>Invite to Your Household</DialogTitle>
                            <DialogContent>
                                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                                {success ? (
                                    <>
                                        <Alert severity="success" sx={{ mb: 3 }}>
                                            Invitation sent successfully!
                                        </Alert>

                                        {inviteLink && (
                                            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                                                <Typography variant="subtitle1" gutterBottom>
                                                    Share this invitation link directly:
                                                </Typography>

                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    p: 1.5,
                                                    bgcolor: '#f5f5f5',
                                                    borderRadius: 1,
                                                    mb: 2
                                                }}>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            flexGrow: 1,
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            fontSize: '0.9rem',
                                                            fontFamily: 'monospace'
                                                        }}
                                                    >
                                                        {inviteLink}
                                                    </Typography>
                                                    <IconButton
                                                        onClick={copyToClipboard}
                                                        color={copied ? "success" : "default"}
                                                        size="small"
                                                    >
                                                        {copied ? <CheckCircleIcon /> : <CopyIcon />}
                                                    </IconButton>
                                                </Box>

                                                <Typography variant="body2" color="text.secondary">
                                                    <strong>Note:</strong> If the recipient doesn't receive the email, you can share this link with them directly.
                                                </Typography>
                                            </Box>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <Typography variant="body1" sx={{ mb: 2 }}>
                                            Enter the email address of the person you want to invite to your household.
                                        </Typography>

                                        <Field
                                            as={TextField}
                                            fullWidth
                                            label="Email Address"
                                            name="email"
                                            type="email"
                                            error={touched.email && Boolean(errors.email)}
                                            helperText={touched.email && errors.email}
                                            sx={{ mb: 2 }}
                                        />
                                    </>
                                )}
                            </DialogContent>

                            <DialogActions sx={{ px: 3, pb: 2 }}>
                                <Button
                                    onClick={handleClose}
                                    disabled={isSubmitting || isLoading}
                                >
                                    {success ? 'Done' : 'Cancel'}
                                </Button>

                                {!success && (
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        disabled={isSubmitting || isLoading}
                                        startIcon={isSubmitting || isLoading ? <CircularProgress size={20} /> : <SendIcon />}
                                    >
                                        {isSubmitting || isLoading ? 'Sending...' : 'Send Invitation'}
                                    </Button>
                                )}
                            </DialogActions>
                        </Form>
                    )}
                </Formik>
            </Dialog>
        </>
    );
};

export default InviteForm;
