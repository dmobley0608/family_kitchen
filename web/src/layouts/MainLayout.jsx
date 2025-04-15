import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
    AppBar, Box, Toolbar, Typography, Button, IconButton,
    Drawer, List, ListItem, ListItemIcon, ListItemText,
    Container, Divider, Avatar, useTheme
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    Restaurant as RecipeIcon,
    Home as HomeIcon,
    People as HouseholdIcon,
    Add as AddIcon,
    Logout as LogoutIcon,
    LocalGroceryStoreOutlined,
    MenuBookOutlined
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';

const MainLayout = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const navigate = useNavigate();
    const theme = useTheme();

    const toggleDrawer = () => {
        setDrawerOpen(!drawerOpen);
    };

    const navigateTo = (path) => {
        navigate(path);
        setDrawerOpen(false);
    };

    const menuItems = [
        { text: 'Home', icon: <HomeIcon />, path: '/' },
        { text: 'Recipes', icon: <RecipeIcon />, path: '/recipes' }
    ];

    // Only show these items if the user is not authenticated
    const unauthenticatedMenuItems = [
        { text: 'Login', icon: <LogoutIcon />, path: '/login' },
        { text: 'Register', icon: <AddIcon />, path: '/register' }
    ];

    const authenticatedMenuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'Household', icon: <HouseholdIcon />, path: '/household' },
        { text: 'Meal Plan', icon: <MenuBookOutlined />, path: '/meal-planner' },
        { text: 'Shopping List', icon: <LocalGroceryStoreOutlined />, path: '/shopping-lists' },
        { text: 'Add Recipe', icon: <AddIcon />, path: '/recipes/create' },
        { text: 'Profile', icon: <Avatar />, path: '/profile' }
    ];


    // Handle window resize for responsive design
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <AppBar position="fixed">
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={toggleDrawer}
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ cursor: 'pointer' }} onClick={() => navigateTo('/')}>
                        Family Kitchen
                    </Typography>

                    {windowWidth > 400 && (
                        <>
                            {isAuthenticated ? (
                                <Box sx={{ display: 'flex', marginLeft: 'auto', alignItems: 'center' }}>
                                    <Typography variant="body1" sx={{ mr: 2 }}>
                                        {user?.name}
                                    </Typography>
                                    <Button color="inherit" onClick={logout}>
                                        Logout
                                    </Button>
                                </Box>
                            ) : (
                                <Box sx={{ marginLeft: 'auto' }}>
                                    <Button color="inherit" onClick={() => navigateTo('/login')}>Login</Button>
                                    <Button color="inherit" onClick={() => navigateTo('/register')}>Register</Button>
                                </Box>
                            )}
                        </>
                    )}
                </Toolbar>
            </AppBar>
            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={toggleDrawer}
            >
                <Box
                    sx={{ width: 250 }}
                    role="presentation"
                >
                    {isAuthenticated && (
                        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                                {user?.name?.[0].toUpperCase()}
                            </Avatar>
                            <Typography variant="subtitle1">{user?.name}</Typography>
                        </Box>
                    )}
                    <Divider />
                    <List>
                        {menuItems.map((item) => (
                            <ListItem button key={item.text} onClick={() => navigateTo(item.path)}>
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItem>
                        ))}
                    </List>
                    {!isAuthenticated && (
                        <>
                            <Divider />
                            <List>
                                {unauthenticatedMenuItems.map((item) => (
                                    <ListItem button key={item.text} onClick={() => navigateTo(item.path)}>
                                        <ListItemIcon>{item.icon}</ListItemIcon>
                                        <ListItemText primary={item.text} />
                                    </ListItem>
                                ))}
                            </List>
                        </>
                    )}
                    {isAuthenticated && (
                        <>
                            <Divider />
                            <List>
                                {authenticatedMenuItems.map((item) => (
                                    <ListItem button key={item.text} onClick={() => navigateTo(item.path)}>
                                        <ListItemIcon>{item.icon}</ListItemIcon>
                                        <ListItemText primary={item.text} />
                                    </ListItem>
                                ))}
                                <ListItem button onClick={logout}>
                                    <ListItemIcon><LogoutIcon /></ListItemIcon>
                                    <ListItemText primary="Logout" />
                                </ListItem>
                            </List>
                        </>
                    )}
                </Box>
            </Drawer>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    pt: 8,
                    minHeight: '100vh',
                    width: '100%',
                    backgroundColor: 'background.default'
                }}
            >
                <Container maxWidth="lg" sx={{ py: 3 }}>
                    <Outlet />
                </Container>
            </Box>

        </Box>
    );
};

export default MainLayout;
