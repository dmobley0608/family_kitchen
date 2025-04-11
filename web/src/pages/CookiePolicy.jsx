import React from 'react';
import { Box, Typography, Paper, Container, Breadcrumbs, Link, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const CookiePolicy = () => {
    return (
        <Container maxWidth="md">
            <Box sx={{ py: 4 }}>
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                    <Link component={RouterLink} to="/" color="inherit">
                        Home
                    </Link>
                    <Typography color="text.primary">Cookie Policy</Typography>
                </Breadcrumbs>

                <Typography variant="h4" component="h1" gutterBottom>
                    Cookie Policy
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Last updated: {new Date().toLocaleDateString()}
                </Typography>

                <Paper sx={{ p: 4, mt: 3 }}>
                    <Typography paragraph>
                        This Cookie Policy explains how Family Kitchen uses cookies and similar technologies to recognize you when
                        you visit our website. It explains what these technologies are and why we use them, as well as your rights
                        to control our use of them.
                    </Typography>

                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        What Are Cookies?
                    </Typography>
                    <Typography paragraph>
                        Cookies are small data files that are placed on your computer or mobile device when you visit a website.
                        Cookies are widely used by website owners to make their websites work, or to work more efficiently,
                        as well as to provide reporting information.
                    </Typography>
                    <Typography paragraph>
                        Cookies set by the website owner (in this case, Family Kitchen) are called "first-party cookies."
                        Cookies set by parties other than the website owner are called "third-party cookies." Third-party cookies
                        enable third-party features or functionality to be provided on or through the website (e.g., advertising,
                        interactive content, and analytics).
                    </Typography>

                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Why We Use Cookies
                    </Typography>
                    <Typography paragraph>
                        We use first-party and third-party cookies for several reasons. Some cookies are required for technical
                        reasons for our website to operate, and we refer to these as "essential" or "strictly necessary" cookies.
                        Other cookies also enable us to track and target the interests of our users to enhance the experience on
                        our website. Third parties serve cookies through our website for analytics and other purposes.
                    </Typography>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="h6" gutterBottom>
                        Types of Cookies We Use
                    </Typography>

                    <Typography fontWeight="bold" sx={{ mt: 2 }}>
                        Essential Cookies
                    </Typography>
                    <Typography paragraph>
                        These cookies are strictly necessary to provide you with services available through our website and to use
                        some of its features, such as access to secure areas. Because these cookies are strictly necessary to deliver
                        the website, you cannot refuse them without impacting how our website functions.
                    </Typography>
                    <Typography paragraph fontStyle="italic">
                        Examples: Authentication cookies, security cookies
                    </Typography>

                    <Typography fontWeight="bold" sx={{ mt: 2 }}>
                        Performance and Functionality Cookies
                    </Typography>
                    <Typography paragraph>
                        These cookies are used to enhance the performance and functionality of our website but are non-essential to
                        their use. However, without these cookies, certain functionality may become unavailable.
                    </Typography>
                    <Typography paragraph fontStyle="italic">
                        Examples: Language preference cookies, user interface customization cookies
                    </Typography>

                    <Typography fontWeight="bold" sx={{ mt: 2 }}>
                        Analytics and Customization Cookies
                    </Typography>
                    <Typography paragraph>
                        These cookies collect information that is used either in aggregate form to help us understand how our website
                        is being used or how effective our marketing campaigns are, or to help us customize our website for you.
                    </Typography>
                    <Typography paragraph fontStyle="italic">
                        Examples: Google Analytics cookies
                    </Typography>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="h6" gutterBottom>
                        How to Control Cookies
                    </Typography>
                    <Typography paragraph>
                        You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies,
                        you may still use our website, though your access to some functionality and areas of our website may be restricted.
                    </Typography>
                    <Typography paragraph>
                        As the means by which you can refuse cookies through your web browser controls vary from browser-to-browser,
                        you should visit your browser's help menu for more information.
                    </Typography>

                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Contact Us
                    </Typography>
                    <Typography paragraph>
                        If you have any questions about our use of cookies or this Cookie Policy, please contact us at privacy@familykitchen.com.
                    </Typography>
                </Paper>
            </Box>
        </Container>
    );
};

export default CookiePolicy;
