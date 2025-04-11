import React from 'react';
import { Box, Typography, Link, Container, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
    return (
        <Box component="footer" sx={{ py: 3, mt: 'auto', bgcolor: 'background.paper' }}>
            <Container maxWidth="lg">
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'center', md: 'flex-start' } }}>
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: { xs: 2, md: 0 } }}>
                        © {new Date().getFullYear()} Family Kitchen. All rights reserved.
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Link component={RouterLink} to="/terms-and-conditions" color="textSecondary" variant="body2">
                            Terms & Conditions
                        </Link>
                        <Link component={RouterLink} to="/cookie-policy" color="textSecondary" variant="body2">
                            Cookie Policy
                        </Link>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default Footer;
