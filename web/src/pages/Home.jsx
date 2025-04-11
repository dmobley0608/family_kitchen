import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Typography, Container,
  Grid, Card, CardContent, CardMedia,
  Stack
} from '@mui/material';
import {
  RestaurantMenu as RestaurantIcon,
  People as FamilyIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box
        sx={{
          py: 8,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Welcome to Family Kitchen
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph sx={{ maxWidth: 600, mb: 4 }}>
          Share recipes, plan meals, and organize ingredients with your household members
        </Typography>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="center"
        >
          <Button size="large" variant="contained" onClick={() => navigate('/recipes')}>
            Browse Recipes
          </Button>
          {!user && <Button size="large" variant="outlined" onClick={() => navigate('/register')}>
            Create Account
          </Button>
          }
        </Stack>
      </Box>

      {/* Features Section */}
      <Grid container spacing={4} sx={{ my: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
              <RestaurantIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography gutterBottom variant="h5" component="h2">
                Recipe Management
              </Typography>
              <Typography>
                Create, store, and organize your favorite recipes in one place.
                Categorize them and share with your family.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
              <FamilyIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography gutterBottom variant="h5" component="h2">
                Household Collaboration
              </Typography>
              <Typography>
                Create a household and invite family members to share recipes and
                meal planning responsibilities.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
              <ShareIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography gutterBottom variant="h5" component="h2">
                Public Recipe Sharing
              </Typography>
              <Typography>
                Choose to make recipes public or keep them private within your household.
                Find inspiration from other users' public recipes.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home;
