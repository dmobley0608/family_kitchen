import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Container } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const AuthLayout = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    return (
        <Container component="main" maxWidth="lg">
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    pt: 8,
                    pb: 6
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        mb: 3
                    }}
                >
                    <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        Family Kitchen
                    </Typography>
                </Box>
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                    <Outlet />
                </Paper>
            </Box>
        </Container>
    );
};

export default AuthLayout;
