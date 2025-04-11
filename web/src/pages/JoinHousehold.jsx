import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Box, Container, Typography, Paper, Button,
    TextField, CircularProgress, Alert,
    Divider, Grid
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import * as invitationService from '../services/invitationService';
import * as authService from '../services/authService';

const JoinHousehold = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, login, user } = useAuth();

    const [invitation, setInvitation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [joinSuccess, setJoinSuccess] = useState(false);

    useEffect(() => {
        const verifyInvitation = async () => {
            try {
                setLoading(true);
                const result = await invitationService.verifyInvitation(token);
                setInvitation(result.invitation);
                setEmail(result.invitation.email); // Pre-fill email from invitation
            } catch (error) {
                setError(error.response?.data?.message || 'Invalid or expired invitation');
            } finally {
                setLoading(false);
            }
        };

        verifyInvitation();
    }, [token]);

    // Fix the auto-accept logic for logged-in users
    useEffect(() => {
        const tryAutoAccept = async () => {
            if (invitation && isAuthenticated && user && user.email === invitation.email) {
                try {
                    setSubmitting(true);
                    // Send a proper JSON object with no additional text
                    const response = await invitationService.acceptInvitation(token);
                    setJoinSuccess(true);

                    // Navigate to household page after successful join
                    setTimeout(() => {
                        navigate('/household');
                    }, 2000);
                } catch (err) {
                    console.error('Join error:', err);
                    setError(err.response?.data?.message || 'Failed to join household');
                    setSubmitting(false);
                }
            }
        };

        tryAutoAccept();
    }, [invitation, isAuthenticated, user, token, navigate]);

    // Fix the manual join function too
    const handleJoinAsNewUser = async (e) => {
        e.preventDefault();

        // Form validation
        if (!name || !email || !password) {
            setError('Please fill in all required fields');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            setSubmitting(true);
            setError('');

            // Register new user - make sure this sends valid JSON
            await authService.register({ name, email, password });
            console.log(email, password);
            // Login with new credentials
            await login(email, password);
            console.log('Logged in successfully:', email);
            // Accept invitation with proper JSON
            await invitationService.acceptInvitation(token);

            setJoinSuccess(true);

            // Redirect to household page
            setTimeout(() => {
                navigate('/household');
            }, 2000);
        } catch (err) {
            console.error('Registration/join error:', err);
            setError(err.response?.data?.message || 'Failed to create account and join household');
            setSubmitting(false);
        }
    };

    const handleLoginAndJoin = () => {
        // Store invitation token in session storage for post-login processing
        sessionStorage.setItem('pendingInvitation', token);
        navigate(`/login?redirect=/join-household/${token}`);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" >
                <Paper sx={{ p: 4, mt: 4 }}>
                    <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
                    <Typography variant="body1" align="center" sx={{ mb: 3 }}>
                        This invitation may have expired or is not valid.
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Button
                            variant="contained"
                            component={Link}
                            to="/"
                        >
                            Go to Homepage
                        </Button>
                    </Box>
                </Paper>
            </Container>
        );
    }

    if (joinSuccess) {
        return (
            <Container maxWidth="lg" >
                <Paper sx={{ p: 4, mt: 4, textAlign: 'center' }}>
                    <Alert severity="success" sx={{ mb: 3 }}>
                        Successfully joined household!
                    </Alert>
                    <Typography variant="h6">
                        Welcome to {invitation?.householdName || 'the household'}!
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 2, mb: 3 }}>
                        You're being redirected to the household page...
                    </Typography>
                    <CircularProgress size={30} />
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg"  >
            <Paper sx={{ p: 4, mt: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Join Household
                </Typography>

                <Alert severity="info" sx={{ mb: 3 }}>
                    You've been invited to join <strong>{invitation?.householdName}</strong> by <strong>{invitation?.invitedBy}</strong>
                </Alert>

                {isAuthenticated ? (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Ready to Join
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 3 }}>
                            You're signed in as {user?.email}. Click the button below to accept the invitation.
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            disabled={submitting}
                            onClick={async () => {
                                try {
                                    setSubmitting(true);
                                    await invitationService.acceptInvitation(token);
                                    setJoinSuccess(true);
                                    setTimeout(() => navigate('/household'), 2000);
                                } catch (err) {
                                    setError(err.response?.data?.message || 'Failed to join household');
                                    setSubmitting(false);
                                }
                            }}
                        >
                            {submitting ? <CircularProgress size={24} /> : 'Join Household'}
                        </Button>
                    </Box>
                ) : (
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <Box>
                                <Typography variant="h6" gutterBottom>
                                    Create a New Account
                                </Typography>
                                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                    Join as a new user to access Family Kitchen
                                </Typography>

                                <form onSubmit={handleJoinAsNewUser}>
                                    <TextField
                                        fullWidth
                                        label="Full Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        margin="normal"
                                        required
                                    />

                                    <TextField
                                        fullWidth
                                        label="Email Address"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        margin="normal"
                                        required
                                        disabled={!!invitation?.email} // Pre-filled from invitation
                                    />

                                    <TextField
                                        fullWidth
                                        label="Password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        margin="normal"
                                        required
                                    />

                                    <TextField
                                        fullWidth
                                        label="Confirm Password"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        margin="normal"
                                        required
                                    />

                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        sx={{ mt: 2 }}
                                        disabled={submitting}
                                    >
                                        {submitting ? <CircularProgress size={24} /> : 'Create Account & Join'}
                                    </Button>
                                </form>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <Typography variant="h6" gutterBottom>
                                    Already Have an Account?
                                </Typography>
                                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                    Sign in with your existing account to join this household
                                </Typography>

                                <Button
                                    variant="outlined"
                                    color="primary"
                                    fullWidth
                                    onClick={handleLoginAndJoin}
                                    sx={{ mt: 2 }}
                                >
                                    Sign In & Join
                                </Button>

                                <Box sx={{ mt: 'auto', pt: 4 }}>
                                    <Divider sx={{ mb: 2 }} />
                                    <Typography variant="body2" color="text.secondary">
                                        Note: This invitation was sent to {invitation?.email}.
                                        If you have a different email address, you'll need to ask for a new invitation.
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                )}
            </Paper>
        </Container>
    );
};

export default JoinHousehold;
