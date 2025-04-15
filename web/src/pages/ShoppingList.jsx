import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Box, Typography, Paper, List, ListItem, ListItemText, ListItemIcon, ListItemSecondaryAction,
    Checkbox, IconButton, Button, Divider, TextField, FormControl, InputLabel,
    Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions,
    CircularProgress, Alert, Chip, Grid
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Add as AddIcon,
    ArrowBack as ArrowBackIcon,
    LocalPrintshop as PrintIcon,
    Edit as EditIcon,
    ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import {
    useGetShoppingListByIdQuery,
    useUpdateShoppingListMutation,
    useAddItemToListMutation,
    useRemoveItemFromListMutation,
    useToggleItemPurchasedMutation
} from '../services/api/shoppingListsApiSlice';
import { useGetAllIngredientsQuery } from '../services/api/ingredientsApiSlice';
import { useAuth } from '../contexts/AuthContext';

const unitOptions = [
    'tsp', 'tbsp', 'cup', 'oz', 'lb', 'g', 'kg', 'ml', 'l',
    'pinch', 'whole', 'slice', 'clove'
];

const ShoppingList = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    // RTK Query hooks
    const {
        data: shoppingList,
        isLoading,
        error: fetchError,
        refetch
    } = useGetShoppingListByIdQuery(id);

    const { data: ingredients = [] } = useGetAllIngredientsQuery();

    // Mutations
    const [updateShoppingList] = useUpdateShoppingListMutation();
    const [addItemToList] = useAddItemToListMutation();
    const [removeItemFromList] = useRemoveItemFromListMutation();
    const [toggleItemPurchased] = useToggleItemPurchasedMutation();

    // Local state
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // For adding new items
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [newItemName, setNewItemName] = useState('');
    const [newItemQuantity, setNewItemQuantity] = useState(1);
    const [newItemUnit, setNewItemUnit] = useState('whole');
    const [selectedIngredientId, setSelectedIngredientId] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // For editing list name
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if (shoppingList) {
            setEditedName(shoppingList.name);
        }
    }, [shoppingList]);

    // Group items by purchase status and sort alphabetically
    const groupItems = (items) => {
        if (!items || !Array.isArray(items)) return { notPurchased: [], purchased: [] };

        const notPurchased = items
            .filter(item => !item.purchased)
            .sort((a, b) => {
                const nameA = item => item.ingredient ? item.ingredient.name : item.name;
                return nameA(a).localeCompare(nameA(b));
            });

        const purchased = items
            .filter(item => item.purchased)
            .sort((a, b) => {
                const nameA = item => item.ingredient ? item.ingredient.name : item.name;
                return nameA(a).localeCompare(nameA(b));
            });

        return { notPurchased, purchased };
    };

    const handleToggleItemPurchased = async (itemId) => {
        try {
            await toggleItemPurchased({ id, itemId }).unwrap();
            setSuccess('Item status updated');
        } catch (error) {
            console.error('Error updating item:', error);
            setError('Failed to update item status');
        }
    };

    const handleRemoveItem = async (itemId) => {
        try {
            await removeItemFromList({ id, itemId }).unwrap();
            setSuccess('Item removed successfully');
        } catch (error) {
            console.error('Error removing item:', error);
            setError('Failed to remove item');
        }
    };

    const handleAddNewItem = () => {
        setNewItemName('');
        setNewItemQuantity(1);
        setNewItemUnit('whole');
        setSelectedIngredientId('');
        setOpenAddDialog(true);
    };

    const handleSubmitNewItem = async () => {
        try {
            if (!selectedIngredientId && !newItemName) {
                setError('Please select or enter an ingredient name');
                return;
            }

            const itemData = {
                quantity: newItemQuantity,
                unit: newItemUnit
            };

            if (selectedIngredientId) {
                itemData.ingredientId = selectedIngredientId;
            } else {
                itemData.name = newItemName;
            }

            await addItemToList({ id, itemData }).unwrap();
            setOpenAddDialog(false);
            setSuccess('Item added successfully');
        } catch (error) {
            console.error('Error adding item:', error);
            setError('Failed to add item');
        }
    };

    const handleSaveListName = async () => {
        try {
            if (!editedName.trim()) {
                setError('List name cannot be empty');
                return;
            }

            await updateShoppingList({ id, name: editedName }).unwrap();
            setIsEditingName(false);
            setSuccess('List name updated successfully');
        } catch (error) {
            console.error('Error updating list name:', error);
            setError('Failed to update list name');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const filterIngredients = (ingredients, query) => {
        if (!query) return ingredients;
        return ingredients.filter(ingredient =>
            ingredient.name.toLowerCase().includes(query.toLowerCase())
        );
    };

    const filteredIngredients = filterIngredients(ingredients, searchQuery);

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (fetchError) {
        return (
            <Box sx={{ p: 4 }}>
                <Alert severity="error">Failed to load shopping list</Alert>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/shopping-lists')}
                    sx={{ mt: 2 }}
                >
                    Back to Shopping Lists
                </Button>
            </Box>
        );
    }

    if (!shoppingList) {
        return (
            <Box sx={{ p: 4 }}>
                <Alert severity="error">Shopping list not found</Alert>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/shopping-lists')}
                    sx={{ mt: 2 }}
                >
                    Back to Shopping Lists
                </Button>
            </Box>
        );
    }

    const { notPurchased, purchased } = groupItems(shoppingList.items);

    return (
        <Box className="shopping-list-page">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }} className="no-print">
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/shopping-lists')}
                >
                    Back to Lists
                </Button>

                <Box>
                    <Button
                        startIcon={<PrintIcon />}
                        variant="outlined"
                        onClick={handlePrint}
                        sx={{ mr: 1 }}
                    >
                        Print
                    </Button>
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')} className="no-print">
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')} className="no-print">
                    {success}
                </Alert>
            )}

            <Paper sx={{ p: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    {isEditingName ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <TextField
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                autoFocus
                                fullWidth
                                variant="outlined"
                                sx={{ mr: 1 }}
                            />
                            <Button onClick={handleSaveListName} variant="contained" size="small">
                                Save
                            </Button>
                            <Button onClick={() => setIsEditingName(false)} variant="outlined" size="small" sx={{ ml: 1 }}>
                                Cancel
                            </Button>
                        </Box>
                    ) : (
                        <>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <ShoppingCartIcon sx={{ mr: 1 }} />
                                <Typography variant="h5" component="h1">
                                    {shoppingList.name}
                                </Typography>
                                <IconButton
                                    size="small"
                                    onClick={() => setIsEditingName(true)}
                                    sx={{ ml: 1 }}
                                    className="no-print"
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Box>

                            <Box className="no-print">
                                <Button
                                    startIcon={<AddIcon />}
                                    variant="contained"
                                    color="primary"
                                    onClick={handleAddNewItem}
                                >
                                    Add Item
                                </Button>
                            </Box>
                        </>
                    )}
                </Box>

                {shoppingList.recipes && shoppingList.recipes.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Recipes Included:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {shoppingList.recipes.map(recipe => (
                                <Chip
                                    key={recipe._id}
                                    label={recipe.title}
                                    component={Link}
                                    to={`/recipes/${recipe._id}`}
                                    clickable
                                />
                            ))}
                        </Box>
                    </Box>
                )}

                <Divider sx={{ mb: 2 }} />

                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Items to Purchase ({notPurchased.length})
                    </Typography>

                    {notPurchased.length > 0 ? (
                        <List>
                            {notPurchased.map(item => (
                                <ListItem
                                    key={item._id}
                                    sx={{
                                        borderBottom: '1px solid #eee',
                                        py: 1
                                    }}
                                >
                                    <ListItemIcon className="no-print">
                                        <Checkbox
                                            edge="start"
                                            checked={item.purchased}
                                            onChange={() => handleToggleItemPurchased(item._id)}
                                        />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.ingredient ? item.ingredient.name : item.name}
                                        secondary={`${item.quantity} ${item.unit}`}
                                    />
                                    <ListItemSecondaryAction className="no-print">
                                        <IconButton
                                            edge="end"
                                            color="error"
                                            onClick={() => handleRemoveItem(item._id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            All items are marked as purchased!
                        </Typography>
                    )}
                </Box>

                {purchased.length > 0 && (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Purchased Items ({purchased.length})
                        </Typography>

                        <List className="purchased-items">
                            {purchased.map(item => (
                                <ListItem
                                    key={item._id}
                                    sx={{
                                        borderBottom: '1px solid #eee',
                                        py: 1,
                                        color: 'text.secondary',
                                        textDecoration: 'line-through'
                                    }}
                                >
                                    <ListItemIcon className="no-print">
                                        <Checkbox
                                            edge="start"
                                            checked={item.purchased}
                                            onChange={() => handleToggleItemPurchased(item._id)}
                                        />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.ingredient ? item.ingredient.name : item.name}
                                        secondary={`${item.quantity} ${item.unit}`}
                                    />
                                    <ListItemSecondaryAction className="no-print">
                                        <IconButton
                                            edge="end"
                                            color="error"
                                            onClick={() => handleRemoveItem(item._id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                )}
            </Paper>

            {/* Add Item Dialog */}
            <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add Item to Shopping List</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2, mb: 2 }}>
                        <TextField
                            fullWidth
                            label="Search ingredients"
                            variant="outlined"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ mb: 2 }}
                        />

                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Select an existing ingredient</InputLabel>
                            <Select
                                value={selectedIngredientId}
                                label="Select an existing ingredient"
                                onChange={(e) => {
                                    setSelectedIngredientId(e.target.value);
                                    setNewItemName(''); // Clear custom name when selecting existing ingredient
                                }}
                            >
                                <MenuItem value="">
                                    <em>Add custom item instead</em>
                                </MenuItem>
                                {filteredIngredients.map(ingredient => (
                                    <MenuItem key={ingredient._id} value={ingredient._id}>
                                        {ingredient.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {!selectedIngredientId && (
                            <TextField
                                fullWidth
                                label="Custom item name"
                                variant="outlined"
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                sx={{ mb: 2 }}
                            />
                        )}

                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Quantity"
                                    variant="outlined"
                                    type="number"
                                    value={newItemQuantity}
                                    onChange={(e) => setNewItemQuantity(parseFloat(e.target.value) || 0)}
                                    inputProps={{ min: 0, step: 0.1 }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Unit</InputLabel>
                                    <Select
                                        value={newItemUnit}
                                        label="Unit"
                                        onChange={(e) => setNewItemUnit(e.target.value)}
                                    >
                                        {unitOptions.map(unit => (
                                            <MenuItem key={unit} value={unit}>
                                                {unit}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleSubmitNewItem}
                        variant="contained"
                        color="primary"
                    >
                        Add to List
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Print Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
          @media print {
            .no-print {
              display: none !important;
            }
            .purchased-items {
              color: #888 !important;
            }
            @page {
              size: portrait;
              margin: 1cm;
            }
          }
        `}}
            />
        </Box>
    );
};

export default ShoppingList;
