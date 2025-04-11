import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Card, CardContent, CardActions,
  Button, TextField, InputAdornment, FormControl,
  InputLabel, Select, MenuItem, CircularProgress,
  Chip, Divider, CardMedia
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Restaurant as RestaurantIcon
} from '@mui/icons-material';
import * as recipeService from '../services/recipeService';
import * as categoryService from '../services/categoryService';
import { useAuth } from '../contexts/AuthContext';

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Helper function to get the proper image URL
  const getImageUrl = (recipe) => {
    if (recipe?.image?.url) {
      if (recipe.image.url.startsWith('/uploads/')) {
        return `${import.meta.env.VITE_API_URL.split('/api')[0]}${recipe.image.url}`;
      }
      return recipe.image.url;
    }
    return null;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [recipesData, categoriesData] = await Promise.all([
          recipeService.getAllRecipes(),
          categoryService.getAllCategories()
        ]);

        setRecipes(recipesData);
        setFilteredRecipes(recipesData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Filter recipes based on search term and category
    let result = recipes;

    if (searchTerm) {
      result = result.filter((recipe) =>
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter) {
      result = result.filter((recipe) =>
        recipe.category?._id === categoryFilter
      );
    }

    setFilteredRecipes(result);
  }, [searchTerm, categoryFilter, recipes]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setCategoryFilter(event.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Recipes
        </Typography>
        {isAuthenticated && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/recipes/create')}
          >
            Add Recipe
          </Button>
        )}
      </Box>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              label="Search recipes"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={5}>
            <FormControl fullWidth>
              <InputLabel>Filter by Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Filter by Category"
                onChange={handleCategoryChange}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category._id} value={category._id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={clearFilters}
              sx={{ height: '56px' }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {filteredRecipes.length > 0 ? (
        <Grid container spacing={3}>
          {filteredRecipes.map((recipe) => (
            <Grid item xs={12} sm={6} md={4} key={recipe._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardMedia
                  component="div"
                  sx={{
                    height: 180,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {getImageUrl(recipe) ? (
                    <img
                      src={getImageUrl(recipe)}
                      alt={recipe.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center'
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: '100%',
                        bgcolor: 'grey.200',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <RestaurantIcon sx={{ fontSize: 40, color: 'grey.500' }} />
                    </Box>
                  )}
                  {recipe.isPrivate && (
                    <Chip
                      label="Private"
                      size="small"
                      color="secondary"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: 'rgba(156, 39, 176, 0.85)',
                        color: 'white'
                      }}
                    />
                  )}
                </CardMedia>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="h2">
                    {recipe.title}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Chip
                      label={recipe.category?.name || 'Uncategorized'}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Typography variant="body2" color="text.secondary">
                      {recipe.prepTime + recipe.cookTime} mins
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    onClick={() => navigate(`/recipes/${recipe._id}`)}
                  >
                    View Recipe
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6">No recipes found</Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search criteria or create a new recipe
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Recipes;
