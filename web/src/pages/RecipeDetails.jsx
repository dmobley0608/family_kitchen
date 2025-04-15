import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Paper, Grid, Chip, Button,
    List, ListItem, ListItemText, Divider, CircularProgress,
    Card, CardContent, Alert, CardMedia, LinearProgress
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    ArrowBack as ArrowBackIcon,
    Sync as SyncIcon
} from '@mui/icons-material';
import { useGetRecipeByIdQuery, useDeleteRecipeMutation } from '../services/api/recipesApiSlice';
import { useAuth } from '../contexts/AuthContext';
import { getImageUrl } from '../utils/tools';

const RecipeDetails = () => {
    const { id } = useParams();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Use RTK Query hooks to fetch recipe and handle delete operation
    const {
        data: recipe,
        isLoading,
        error,
        refetch
    } = useGetRecipeByIdQuery(id);

    const [deleteRecipe, { isLoading: isDeleting }] = useDeleteRecipeMutation();

    // Set up polling for pending images
    useEffect(() => {
        let interval;
        if (recipe?.image?.status === 'pending') {
            interval = setInterval(() => {
                refetch();
            }, 5000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [recipe, refetch]);

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this recipe?')) {
            try {
                await deleteRecipe(id).unwrap();
                navigate('/recipes');
            } catch (err) {
                console.error('Failed to delete the recipe:', err);
            }
        }
    };

    const canEdit = isAuthenticated && recipe && (
        user?._id === recipe.createdBy?._id || user?.household === recipe.household?._id
    );

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 4 }}>
                <Alert severity="error">
                    {error.status === 404 ? 'Recipe not found' : 'Error loading recipe'}
                </Alert>
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

                {recipe.image && (
                    <Box sx={{ mb: 4, maxWidth: "100%", overflow: "hidden", borderRadius: 2 }}>
                        {recipe.image.status === 'pending' ? (
                            <Box sx={{ position: 'relative', height: 300 }}>
                                <Box sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: 'grey.200',
                                    borderRadius: 2
                                }}>
                                    <SyncIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        Image is being processed...
                                    </Typography>
                                    <Box sx={{ width: '80%' }}>
                                        <LinearProgress />
                                    </Box>
                                </Box>
                            </Box>
                        ) : recipe.image.status === 'failed' ? (
                            <Box sx={{
                                height: 300,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'grey.200',
                                borderRadius: 2
                            }}>
                                <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                                    Image upload failed
                                </Typography>
                                {canEdit && (
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => navigate(`/recipes/edit/${recipe._id}`)}
                                    >
                                        Upload a new image
                                    </Button>
                                )}
                            </Box>
                        ) : (
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
                        )}
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
