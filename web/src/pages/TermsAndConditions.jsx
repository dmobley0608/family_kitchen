import React from 'react';
import { Box, Typography, Paper, Container, Breadcrumbs, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const TermsAndConditions = () => {
    return (
        <Container maxWidth="md">
            <Box sx={{ py: 4 }}>
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                    <Link component={RouterLink} to="/" color="inherit">
                        Home
                    </Link>
                    <Typography color="text.primary">Terms and Conditions</Typography>
                </Breadcrumbs>

                <Typography variant="h4" component="h1" gutterBottom>
                    Terms and Conditions
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Last updated: {new Date().toLocaleDateString()}
                </Typography>

                <Paper sx={{ p: 4, mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        1. Acceptance of Terms
                    </Typography>
                    <Typography paragraph>
                        By accessing or using the Family Kitchen service, you agree to be bound by these Terms and Conditions.
                        If you do not agree with any part of these terms, you may not use our service.
                    </Typography>

                    <Typography variant="h6" gutterBottom>
                        2. Description of Service
                    </Typography>
                    <Typography paragraph>
                        Family Kitchen is a recipe management and sharing platform designed for families to organize and share recipes.
                        The service allows users to create, store, and share recipes with household members.
                    </Typography>

                    <Typography variant="h6" gutterBottom>
                        3. User Accounts
                    </Typography>
                    <Typography paragraph>
                        To use certain features of the service, you must create an account. You are responsible for maintaining
                        the confidentiality of your account information and for all activities that occur under your account.
                        You agree to notify us immediately of any unauthorized use of your account.
                    </Typography>

                    <Typography variant="h6" gutterBottom>
                        4. User Content
                    </Typography>
                    <Typography paragraph>
                        Users may post recipes, comments, and other content ("User Content"). By posting User Content, you grant
                        Family Kitchen a non-exclusive, royalty-free license to use, store, and display your User Content in connection
                        with providing the service.
                    </Typography>
                    <Typography paragraph>
                        You are solely responsible for your User Content and the consequences of posting it. We reserve the right to
                        remove any User Content that violates these terms or that we deem inappropriate.
                    </Typography>

                    <Typography variant="h6" gutterBottom>
                        5. Privacy
                    </Typography>
                    <Typography paragraph>
                        Your use of the Family Kitchen service is also governed by our Privacy Policy, which can be found on our website.
                    </Typography>

                    <Typography variant="h6" gutterBottom>
                        6. Limitation of Liability
                    </Typography>
                    <Typography paragraph>
                        Family Kitchen shall not be liable for any indirect, incidental, special, consequential, or punitive damages
                        resulting from your use of or inability to use the service.
                    </Typography>

                    <Typography variant="h6" gutterBottom>
                        7. Changes to Terms
                    </Typography>
                    <Typography paragraph>
                        We reserve the right to modify these Terms at any time. We will provide notice of significant changes to these
                        Terms by posting the new Terms on the site. Your continued use of the service after such modifications constitutes
                        your acceptance of the modified Terms.
                    </Typography>

                    <Typography variant="h6" gutterBottom>
                        8. Governing Law
                    </Typography>
                    <Typography paragraph>
                        These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which
                        the service is operated, without regard to its conflict of law provisions.
                    </Typography>

                    <Typography variant="h6" gutterBottom>
                        9. Contact Information
                    </Typography>
                    <Typography paragraph>
                        If you have any questions about these Terms, please contact us at support@familykitchen.com.
                    </Typography>
                </Paper>
            </Box>
        </Container>
    );
};

export default TermsAndConditions;
