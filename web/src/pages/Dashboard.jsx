import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography, Box, Grid, Card, CardContent,
  CardActions, Button, CircularProgress, Divider
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import * as recipeService from '../services/recipeService';
import * as householdService from '../services/householdService';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [householdRecipes, setHouseholdRecipes] = useState([]);
  const [household, setHousehold] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {

    const fetchData = async () => {
      try {
        setLoading(true);
        const [recipesData, householdData] = await Promise.all([
          recipeService.getAllRecipes(),
          householdService.getHouseholdDetails()
        ]);
      

        // Filter recipes by household
        const filteredRecipes = recipesData.filter(
          recipe => recipe.household?._id === user?.household?._id
        );
        setHouseholdRecipes(filteredRecipes);
        setHousehold(householdData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

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
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {recipe.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Category: {recipe.category?.name || 'Uncategorized'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      By: {recipe.createdBy?.name}
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
