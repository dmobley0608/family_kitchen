import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, Snackbar, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const CookieConsent = () => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user has already accepted cookies
        const cookieConsent = localStorage.getItem('cookieConsent');
        if (!cookieConsent) {
            setOpen(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'true');
        setOpen(false);
    };

    const viewPolicy = () => {
        navigate('/cookie-policy');
        setOpen(false);
    };

    return (
        <Snackbar
            open={open}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            sx={{
                width: '100%',
                maxWidth: '100%',
                bottom: { xs: '0 !important', sm: '24px !important' },
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    p: 2,
                    mx: 2,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'stretch', sm: 'center' },
                    justifyContent: 'space-between',
                    gap: 2,
                    backgroundColor: 'primary.dark',
                    color: 'primary.contrastText',
                }}
            >
                <Box sx={{ flex: 1 }}>
                    <Typography variant="body2">
                        We use cookies to enhance your experience on our site. By continuing to use our site, you consent to our use of cookies.
                        <Link
                            sx={{ ml: 1, color: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}
                            onClick={viewPolicy}
                        >
                            Learn more
                        </Link>
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={viewPolicy}
                        sx={{ color: 'primary.contrastText', borderColor: 'primary.contrastText' }}
                    >
                        Cookie Policy
                    </Button>
                    <Button
                        variant="contained"
                        size="small"
                        onClick={handleAccept}
                        sx={{ bgcolor: 'background.paper', color: 'text.primary' }}
                    >
                        Accept
                    </Button>
                </Box>
            </Paper>
        </Snackbar>
    );
};

export default CookieConsent;
