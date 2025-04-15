import { useState } from 'react';
import {
    Box, Typography, Paper, Button, TextField,
    List, ListItem, ListItemAvatar, ListItemText,
    Avatar, IconButton, CircularProgress,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Alert, Snackbar, Card, CardContent, Grid, Tooltip,
    Chip
} from '@mui/material';
import {
    Delete as DeleteIcon,
    ContentCopy as CopyIcon,
    Refresh as RefreshIcon,
    Person as PersonIcon,
    Email as EmailIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import InviteForm from '../components/InviteForm';
import {
    useGetHouseholdDetailsQuery,
    useUpdateHouseholdNameMutation,
    useGenerateInviteCodeMutation,
    useRemoveMemberMutation
} from '../services/api/householdApiSlice';
import {
    useGetUserInvitationsQuery,
    useResendInvitationMutation
} from '../services/api/invitationsApiSlice';

const Household = () => {
    const { user } = useAuth();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [openNameDialog, setOpenNameDialog] = useState(false);
    const [openJoinDialog, setOpenJoinDialog] = useState(false);
    const [newHouseholdName, setNewHouseholdName] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [copied, setCopied] = useState(false);
    const [confirmRemoveDialogOpen, setConfirmRemoveDialogOpen] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState(null);

    // Use RTK Query hooks
    const {
        data: household,
        isLoading,
        error: householdError
    } = useGetHouseholdDetailsQuery();

    const {
        data: invitations = [],
        isLoading: invitationsLoading
    } = useGetUserInvitationsQuery();

    const [updateHouseholdName] = useUpdateHouseholdNameMutation();
    const [generateInviteCode] = useGenerateInviteCodeMutation();
    const [removeMember] = useRemoveMemberMutation();
    const [resendInvitation] = useResendInvitationMutation();

    // Handle household name change
    const handleUpdateName = async () => {
        try {
            await updateHouseholdName(newHouseholdName);
            setOpenNameDialog(false);
            setSuccess('Household name updated successfully');
        } catch (error) {
            console.error('Error updating household name:', error);
            setError(error.data?.message || 'Failed to update household name');
        }
    };

    // Handle generate invite code
    const handleGenerateInviteCode = async () => {
        try {
            const result = await generateInviteCode().unwrap();
            setSuccess('New invite code generated');
        } catch (error) {
            console.error('Error generating invite code:', error);
            setError(error.data?.message || 'Failed to generate invite code');
        }
    };

    // Handle joining household
    const handleJoinHousehold = async () => {
        try {
            await joinHousehold(inviteCode).unwrap();
            setOpenJoinDialog(false);
            setSuccess('Successfully joined household');
        } catch (error) {
            console.error('Error joining household:', error);
            setError(error.data?.message || 'Invalid invite code');
        }
    };

    // Open remove member dialog
    const openRemoveMemberDialog = (member) => {
        setMemberToRemove(member);
        setConfirmRemoveDialogOpen(true);
    };

    // Handle remove member
    const handleRemoveMember = async () => {
        try {
            await removeMember(memberToRemove._id).unwrap();
            setSuccess('Member removed successfully');
            setConfirmRemoveDialogOpen(false);
        } catch (error) {
            console.error('Error removing member:', error);
            setError(error.data?.message || 'Failed to remove member');
        }
    };

    // Copy invite code to clipboard
    const copyToClipboard = () => {
        navigator.clipboard.writeText(household.inviteCode).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (householdError) {
        setError(householdError.data?.message || 'Failed to load household data');
    }

    const isOwner = household && user && household.owner === user._id;

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Household Management
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Snackbar
                open={!!success}
                autoHideDuration={6000}
                onClose={() => setSuccess('')}
                message={success}
            />

            {household ? (
                <>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            {/* Household Information Card */}
                            <Card sx={{ mb: 4 }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="h5">
                                            {household.name}
                                        </Typography>
                                        {isOwner && (
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => {
                                                    setNewHouseholdName(household.name);
                                                    setOpenNameDialog(true);
                                                }}
                                            >
                                                Rename
                                            </Button>
                                        )}
                                    </Box>

                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Household Owner: {household.members?.find(m => m._id === household.owner)?.name || 'Unknown'}
                                    </Typography>

                                    <Typography variant="body2" gutterBottom>
                                        Total Members: {household.members?.length || 0}
                                    </Typography>
                                </CardContent>
                            </Card>

                            {/* Invite New Members Section */}
                            <Card sx={{ mb: 4 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Invite Members
                                    </Typography>

                                    {/* Add Invite Code Section */}
                                    <Box sx={{
                                        p: 2,
                                        mb: 3,
                                        border: '1px dashed',
                                        borderColor: 'divider',
                                        borderRadius: 1,
                                        backgroundColor: 'background.paper'
                                    }}>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Invite Code
                                        </Typography>

                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            mb: 1.5
                                        }}>
                                            <Box
                                                sx={{
                                                    p: 1.5,
                                                    mr: 1,
                                                    flexGrow: 1,
                                                    fontFamily: 'monospace',
                                                    fontSize: '1.1rem',
                                                    fontWeight: 'medium',
                                                    letterSpacing: 1,
                                                    bgcolor: 'action.hover',
                                                    borderRadius: 1,
                                                    textAlign: 'center'
                                                }}
                                            >
                                                {household?.inviteCode || 'No code available'}
                                            </Box>

                                            <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
                                                <IconButton
                                                    onClick={copyToClipboard}
                                                    color={copied ? 'success' : 'default'}
                                                    disabled={!household?.inviteCode}
                                                >
                                                    <CopyIcon />
                                                </IconButton>
                                            </Tooltip>

                                            {isOwner && (
                                                <Tooltip title="Generate new code">
                                                    <IconButton
                                                        onClick={handleGenerateInviteCode}
                                                        color="primary"
                                                    >
                                                        <RefreshIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </Box>

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Share this code with others to join your household
                                            </Typography>

                                            <Button
                                                variant="outlined"
                                                size="small"
                                                disabled={!household?.inviteCode}
                                                onClick={() => {
                                                    const inviteLink = `${window.location.origin}/join?code=${household.inviteCode}`;
                                                    navigator.clipboard.writeText(inviteLink);
                                                    setSuccess('Invite link copied to clipboard');
                                                }}
                                            >
                                                Share Link
                                            </Button>
                                        </Box>
                                    </Box>

                                    <Typography variant="subtitle1" gutterBottom>
                                        Email Invitation
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        Send an email invitation to someone to join your household.
                                    </Typography>

                                    <Box sx={{ mt: 2 }}>
                                        <InviteForm onInviteSuccess={(newInvitation) => setSuccess('Invitation sent successfully!')} />
                                    </Box>
                                </CardContent>
                            </Card>

                            {/* Pending Invitations */}
                            {invitations.length > 0 && (
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Pending Invitations
                                        </Typography>
                                        <List>
                                            {invitations.filter(inv => !inv.accepted).map((invitation) => (
                                                <ListItem
                                                    key={invitation._id}
                                                    secondaryAction={
                                                        <Box>
                                                            <Chip
                                                                label={new Date(invitation.expires) > new Date() ? 'Active' : 'Expired'}
                                                                color={new Date(invitation.expires) > new Date() ? 'success' : 'error'}
                                                                size="small"
                                                                sx={{ mr: 1 }}
                                                            />
                                                            <IconButton
                                                                size="small"
                                                                onClick={async () => {
                                                                    try {
                                                                        await resendInvitation(invitation._id).unwrap();
                                                                        setSuccess('Invitation resent successfully');
                                                                    } catch (error) {
                                                                        setError(error.data?.message || 'Failed to resend invitation');
                                                                    }
                                                                }}
                                                                title="Resend Invitation"
                                                            >
                                                                <RefreshIcon fontSize="small" />
                                                            </IconButton>
                                                        </Box>
                                                    }
                                                >
                                                    <ListItemAvatar>
                                                        <Avatar>
                                                            <EmailIcon />
                                                        </Avatar>
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={invitation.email}
                                                        secondary={`Sent: ${new Date(invitation.createdAt).toLocaleDateString()}, Expires: ${new Date(invitation.expires).toLocaleDateString()}`}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>

                                        {invitationsLoading && (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                                <CircularProgress size={24} />
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </Grid>

                        <Grid item xs={12} md={6}>
                            {/* Household Members Section */}
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Household Members
                                </Typography>
                                <List>
                                    {household.members?.map((member) => (
                                        <ListItem
                                            key={member._id}
                                            secondaryAction={
                                                isOwner && member._id !== household.owner ? (
                                                    <IconButton
                                                        edge="end"
                                                        aria-label="remove"
                                                        onClick={() => openRemoveMemberDialog(member)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                ) : null
                                            }
                                        >
                                            <ListItemAvatar>
                                                <Avatar>
                                                    {member.name?.charAt(0).toUpperCase() || <PersonIcon />}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={member.name}
                                                secondary={
                                                    <>
                                                        {member.email}
                                                        {member._id === household.owner ? ' (Owner)' : ''}
                                                        {member._id === user?.id ? ' (You)' : ''}
                                                    </>
                                                }
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Paper>
                        </Grid>
                    </Grid>
                </>
            ) : (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" gutterBottom>
                        You don't have a household yet.
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => setOpenJoinDialog(true)}
                    >
                        Join a Household
                    </Button>
                </Paper>
            )}

            {/* Dialogs */}
            <Dialog open={openNameDialog} onClose={() => setOpenNameDialog(false)}>
                <DialogTitle>Rename Household</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="New Household Name"
                        fullWidth
                        variant="outlined"
                        value={newHouseholdName}
                        onChange={(e) => setNewHouseholdName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenNameDialog(false)}>Cancel</Button>
                    <Button onClick={handleUpdateName} variant="contained">Update</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openJoinDialog} onClose={() => setOpenJoinDialog(false)}>
                <DialogTitle>Join Household</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Enter the invite code to join a household. Note: You will leave your current household if you're already in one.
                    </Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Invite Code"
                        fullWidth
                        variant="outlined"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenJoinDialog(false)}>Cancel</Button>
                    <Button onClick={handleJoinHousehold} variant="contained">Join</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={confirmRemoveDialogOpen}
                onClose={() => setConfirmRemoveDialogOpen(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>
                    Remove Member
                </DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        This action cannot be undone.
                    </Alert>
                    <Typography variant="body1">
                        Are you sure you want to remove <strong>{memberToRemove?.name}</strong> from your household?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        They will lose access to all private recipes and household information.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setConfirmRemoveDialogOpen(false)}
                        color="inherit"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleRemoveMember}
                        variant="contained"
                        color="error"
                        startIcon={<DeleteIcon />}
                    >
                        Remove Member
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Household;
