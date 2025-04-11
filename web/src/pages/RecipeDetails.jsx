import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Paper, Grid, Chip, Button,
    List, ListItem, ListItemText, Divider, CircularProgress,
    Card, CardContent, Alert, CardMedia
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import * as recipeService from '../services/recipeService';
import { useAuth } from '../contexts/AuthContext';

const RecipeDetails = () => {
    const { id } = useParams();
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                setLoading(true);
                const data = await recipeService.getRecipeById(id);
                setRecipe(data);
            } catch (error) {
                console.error('Error fetching recipe:', error);
                setError(error.response?.data?.message || 'Failed to load recipe');
            } finally {
                setLoading(false);
            }
        };

        fetchRecipe();
    }, [id]);

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (typeof imagePath === 'string' && imagePath.startsWith('/uploads/')) {
            return `${import.meta.env.VITE_API_URL.split('/api')[0]}${imagePath}`;
        }
        return imagePath;
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this recipe?')) {
            try {
                await recipeService.deleteRecipe(id);
                navigate('/recipes');
            } catch (error) {
                console.error('Error deleting recipe:', error);
                setError('Failed to delete recipe');
            }
        }
    };

    const canEdit = isAuthenticated && recipe && (
        user?._id === recipe.createdBy?._id || user?.household === recipe.household?._id
    );

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 4 }}>
                <Alert severity="error">{error}</Alert>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/recipes')}
                    sx={{ mt: 2 }}
                >
                    Back to Recipes
                </Button>
            </Box>
        );
    }

    if (!recipe) {
        return (
            <Box sx={{ p: 4 }}>
                <Alert severity="warning">Recipe not found</Alert>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/recipes')}
                    sx={{ mt: 2 }}
                >
                    Back to Recipes
                </Button>
            </Box>
        );
    }

    return (
        <Box>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/recipes')}
                sx={{ mb: 2 }}
            >
                Back to Recipes
            </Button>

            <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                        <Typography variant="h4" component="h1" gutterBottom>
                            {recipe.title}
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                            <Chip label={recipe.category?.name || 'Uncategorized'} color="primary" size="small" />
                            {recipe.isPrivate && (
                                <Chip label="Private Recipe" color="secondary" size="small" />
                            )}
                        </Box>

                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Created by {recipe.createdBy?.name} {recipe.household && `(${recipe.household.name})`}
                        </Typography>
                    </Box>

                    {canEdit && (
                        <Box>
                            <Button
                                startIcon={<EditIcon />}
                                variant="outlined"
                                sx={{ mr: 1 }}
                                onClick={() => navigate(`/recipes/edit/${recipe._id}`)}
                            >
                                Edit
                            </Button>
                            <Button
                                startIcon={<DeleteIcon />}
                                variant="outlined"
                                color="error"
                                onClick={handleDelete}
                            >
                                Delete
                            </Button>
                        </Box>
                    )}
                </Box>

                {recipe.image && recipe.image.url && (
                    <Box sx={{ mb: 4, maxWidth: "100%", overflow: "hidden", borderRadius: 2 }}>
                        <CardMedia
                            component="img"
                            height="300"
                            image={getImageUrl(recipe.image.url)}
                            alt={recipe.title}
                            sx={{
                                objectFit: "contain",
                                width: "100%",
                                borderRadius: 2,
                                boxShadow: 2
                            }}
                        />
                    </Box>
                )}

                <Divider sx={{ my: 3 }} />

                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Preparation Time: {recipe.prepTime} minutes
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="bold">
                        Cooking Time: {recipe.cookTime} minutes
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    <Grid item xs={12} md={5}>
                        <Typography variant="h6" gutterBottom>
                            Ingredients
                        </Typography>
                        <List disablePadding>
                            {recipe.ingredients.map((item, index) => (
                                <ListItem key={index} disableGutters divider={index !== recipe.ingredients.length - 1}>
                                    <ListItemText
                                        primary={`${item.ingredient?.name}`}
                                        secondary={`${item.quantity} ${item.unit}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Grid>

                    <Grid item xs={12} md={7}>
                        <Typography variant="h6" gutterBottom>
                            Instructions
                        </Typography>
                        <Card variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                            <CardContent sx={{ whiteSpace: 'pre-line', p: 0 }}>
                                <Typography variant="body1">{recipe.instructions}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

export default RecipeDetails;
