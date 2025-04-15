import { useNavigate } from 'react-router-dom';
import {
  Typography, Box, Grid, Card, CardContent,
  CardActions, Button, CircularProgress, Divider,
  CardMedia
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useGetRecipesQuery } from '../services/api/recipesApiSlice';
import { useGetHouseholdDetailsQuery } from '../services/api/householdApiSlice';
import { useEffect, useState } from 'react';
import { getImageUrl } from '../utils/tools';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [householdRecipes, setHouseholdRecipes] = useState([]);
  // Use RTK Query hooks for data fetching
  const { data: recipes = [], isLoading: recipesLoading } = useGetRecipesQuery();
  const { data: household, isLoading: householdLoading } = useGetHouseholdDetailsQuery();

  useEffect(() => {
    // Debug data
    console.log('All recipes:', recipes);
    console.log('Household data:', household);

    if (recipes && household) {
      // More flexible comparison to handle different object structures
      const filteredRecipes = recipes.filter(recipe => {
        // Debug each recipe's household data
        console.log('Recipe household:', recipe.household);

        // Handle different possible structures
        const recipeHouseholdId = recipe.household?._id || recipe.household?.id || recipe.householdId;
        const currentHouseholdId = household._id || household.id;

        console.log(`Comparing: recipe household ${recipeHouseholdId} vs current ${currentHouseholdId}`);

        return recipeHouseholdId === currentHouseholdId;
      });

      console.log('Filtered recipes:', filteredRecipes);
      setHouseholdRecipes(filteredRecipes);
    }
  }, [recipes, household]);

  console.log(householdRecipes);

  // Determine overall loading state
  const loading = recipesLoading || householdLoading;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          {household?.name || "Your Household"}
        </Typography>
        <Typography variant="body1" paragraph>
          Welcome back, {user?.name}! Here's what's happening in your household.
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate('/household')}
          sx={{ mb: 2 }}
        >
          Manage Household
        </Button>
      </Box>

      <Divider sx={{ mb: 4 }} />

      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">Household Recipes</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/recipes/create')}
          >
            Add Recipe
          </Button>
        </Box>

        <Grid container spacing={3}>
          {householdRecipes.length > 0 ? (
            householdRecipes.slice(0, 6).map((recipe) => (
              <Grid item xs={12} sm={6} md={4} key={recipe._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {recipe.image?.url ? (
                    <CardMedia
                      component="img"
                      height="160"
                      image={getImageUrl(recipe.image.url)}
                      alt={recipe.title}
                      sx={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <Box sx={{
                      height: 100,
                      backgroundColor: 'grey.200',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Typography variant="body2" color="text.secondary">
                        No image available
                      </Typography>
                    </Box>
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {recipe.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Category: {recipe.category?.name || 'Uncategorized'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      By: {recipe.createdBy?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Prep: {recipe.prepTime} min | Cook: {recipe.cookTime} min
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => navigate(`/recipes/${recipe._id}`)}>
                      View
                    </Button>
                    <Button size="small" onClick={() => navigate(`/recipes/edit/${recipe._id}`)}>
                      Edit
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography variant="body1">
                No recipes found. Start by adding your first recipe!
              </Typography>
            </Grid>
          )}
        </Grid>

        {householdRecipes.length > 6 && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button onClick={() => navigate('/recipes')}>View All Recipes</Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;
