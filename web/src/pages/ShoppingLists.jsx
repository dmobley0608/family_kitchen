import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Paper, Button, Grid, Card, CardContent,
    CardActions, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, CircularProgress, Alert, IconButton
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import {
    useGetShoppingListsQuery,
    useCreateShoppingListMutation,
    useDeleteShoppingListMutation
} from '../services/api/shoppingListsApiSlice';
import { useGetRecipesQuery } from '../services/api/recipesApiSlice';
import { useAuth } from '../contexts/AuthContext';

const ShoppingLists = () => {
    // RTK Query hooks
    const {
        data: shoppingLists = [],
        isLoading,
        error: fetchError
    } = useGetShoppingListsQuery();

    const { data: recipes = [] } = useGetRecipesQuery();
    const [createShoppingList, { isLoading: isCreating }] = useCreateShoppingListMutation();
    const [deleteShoppingList] = useDeleteShoppingListMutation();

    // Local state
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [selectedRecipes, setSelectedRecipes] = useState([]);

    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    // Authentication check
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    // Show RTK Query errors
    useEffect(() => {
        if (fetchError) {
            setError('Failed to load shopping lists');
        }
    }, [fetchError]);

    const handleCreateNewList = async () => {
        try {
            if (!newListName.trim()) {
                setError('Please enter a name for your shopping list');
                return;
            }

            const newList = await createShoppingList({
                name: newListName,
                recipeIds: selectedRecipes
            }).unwrap();

            setOpenCreateDialog(false);
            setNewListName('');
            setSelectedRecipes([]);
            setSuccess('Shopping list created successfully');

            // Navigate to the new list
            navigate(`/shopping-lists/${newList._id}`);
        } catch (error) {
            console.error('Error creating shopping list:', error);
            setError('Failed to create shopping list');
        }
    };

    const handleDeleteList = async (id) => {
        if (window.confirm('Are you sure you want to delete this shopping list?')) {
            try {
                await deleteShoppingList(id).unwrap();
                setSuccess('Shopping list deleted successfully');
            } catch (error) {
                console.error('Error deleting shopping list:', error);
                setError('Failed to delete shopping list');
            }
        }
    };

    const handleRecipeToggle = (recipeId) => {
        setSelectedRecipes(prev => {
            if (prev.includes(recipeId)) {
                return prev.filter(id => id !== recipeId);
            } else {
                return [...prev, recipeId];
            }
        });
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
                <Typography variant="h4">Shopping Lists</Typography>

                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenCreateDialog(true)}
                    disabled={isCreating}
                >
                    {isCreating ? <CircularProgress size={24} /> : 'Create New List'}
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                    {success}
                </Alert>
            )}

            {shoppingLists.length > 0 ? (
                <Grid container spacing={3}>
                    {shoppingLists.map(list => (
                        <Grid item xs={12} sm={6} md={4} key={list._id}>
                            <Card
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 3
                                    }
                                }}
                            >
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <ShoppingCartIcon sx={{ mr: 1, color: 'primary.main' }} />
                                            <Typography variant="h6" component="h2">
                                                {list.name}
                                            </Typography>
                                        </Box>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDeleteList(list._id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>

                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        {list.items.length} items
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary">
                                        {list.items.filter(item => item.purchased).length} purchased
                                    </Typography>

                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                        Created {new Date(list.createdAt).toLocaleDateString()}
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button
                                        size="small"
                                        variant="contained"
                                        fullWidth
                                        onClick={() => navigate(`/shopping-lists/${list._id}`)}
                                    >
                                        View List
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6">No shopping lists found</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Create a new shopping list to get started
                    </Typography>
                </Paper>
            )}

            {/* Create New List Dialog */}
            <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Shopping List</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="List Name"
                        fullWidth
                        variant="outlined"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                    />

                    <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
                        Add recipes to your shopping list (optional):
                    </Typography>

                    {recipes.length > 0 ? (
                        <Box sx={{ mt: 1, maxHeight: 300, overflow: 'auto' }}>
                            {recipes.map(recipe => (
                                <Paper
                                    key={recipe._id}
                                    sx={{
                                        p: 2,
                                        mb: 1,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        bgcolor: selectedRecipes.includes(recipe._id) ? 'rgba(0, 0, 0, 0.04)' : 'transparent'
                                    }}
                                >
                                    <Typography>{recipe.title}</Typography>
                                    <Button
                                        size="small"
                                        color={selectedRecipes.includes(recipe._id) ? "error" : "primary"}
                                        onClick={() => handleRecipeToggle(recipe._id)}
                                    >
                                        {selectedRecipes.includes(recipe._id) ? 'Remove' : 'Add'}
                                    </Button>
                                </Paper>
                            ))}
                        </Box>
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            No recipes available
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleCreateNewList}
                        variant="contained"
                        disabled={isCreating}
                    >
                        Create List
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ShoppingLists;
