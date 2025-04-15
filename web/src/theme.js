import { createTheme } from '@mui/material/styles';

// Add a console log to confirm theme initialization
console.log('Initializing custom theme with green primary color #5D9C59');

const theme = createTheme({
    palette: {
        primary: {
            main: '#5D9C59',
            light: '#7FB77E',
            dark: '#3A5A40',
            contrastText: '#fff',
        },
        secondary: {
            main: '#FF731D',
            light: '#FFA559',
            dark: '#C85C2A',
            contrastText: '#fff',
        },
        background: {
            default: '#f8f9fa',
            paper: '#ffffff',
        },
    },
    typography: {
        fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontWeight: 700,
        },
        h2: {
            fontWeight: 600,
        },
        h3: {
            fontWeight: 600,
        },
        button: {
            fontWeight: 600,
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
                },
            },
        },
    },
});

// Add this to make debugging easier
if (theme.palette.primary.main !== '#5D9C59') {
    console.error('Theme initialization error: Primary color is not set correctly');
}

export default theme;
