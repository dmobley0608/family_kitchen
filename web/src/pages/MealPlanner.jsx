import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Button, Grid, Card, CardContent,
    Dialog, DialogTitle, DialogContent, DialogActions,
    FormControl, InputLabel, Select, MenuItem, TextField,
    Tabs, Tab, IconButton, Tooltip, CircularProgress, Alert
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    ShoppingCart as ShoppingCartIcon,
    ArrowForward as ArrowForwardIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay } from 'date-fns';
import {
    useGetMealPlansQuery,
    useGetMealPlanByIdQuery,
    useCreateMealPlanMutation,
    useAddMealToPlanMutation,
    useRemoveMealFromPlanMutation
} from '../services/api/mealPlansApiSlice';
import { useGetRecipesQuery } from '../services/api/recipesApiSlice';
import { useGenerateFromMealPlanMutation } from '../services/api/shoppingListsApiSlice';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const mealTypes = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Snack' }
];

const MealPlanner = () => {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date()));
    const [mealPlan, setMealPlan] = useState(null);
    const [mealPlanId, setMealPlanId] = useState(null);

    const [openDialog, setOpenDialog] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedMealType, setSelectedMealType] = useState('');
    const [selectedRecipeId, setSelectedRecipeId] = useState('');
    const [mealNotes, setMealNotes] = useState('');
    const [editingMealId, setEditingMealId] = useState(null);

    const [weekDays, setWeekDays] = useState([]);

    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // RTK Query hooks
    const { data: recipes = [] } = useGetRecipesQuery();
    const { data: mealPlans = [] } = useGetMealPlansQuery();
    const { data: currentMealPlanData, refetch } = useGetMealPlanByIdQuery(mealPlanId, {
        skip: !mealPlanId,
    });

    const [createMealPlan, { isLoading: isCreating }] = useCreateMealPlanMutation();
    const [addMealToPlan, { isLoading: isAddingMeal }] = useAddMealToPlanMutation();
    const [removeMealFromPlan, { isLoading: isRemovingMeal }] = useRemoveMealFromPlanMutation();
    const [generateShoppingList, { isLoading: isGeneratingList }] = useGenerateFromMealPlanMutation();

    // Authentication check
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    // Generate array of weekdays based on current week
    useEffect(() => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            days.push(addDays(currentWeek, i));
        }
        setWeekDays(days);
    }, [currentWeek]);

    // Find meal plan for current week
    useEffect(() => {
        const startDate = format(currentWeek, 'yyyy-MM-dd');
        const endDate = format(addDays(currentWeek, 6), 'yyyy-MM-dd');

        const currentMealPlan = mealPlans.find(plan => {
            if (!plan || !plan.startDate || !plan.endDate) return false;
            const planStart = new Date(plan.startDate).toISOString().split('T')[0];
            const planEnd = new Date(plan.endDate).toISOString().split('T')[0];
            return planStart === startDate && planEnd === endDate;
        });

        if (currentMealPlan) {
            setMealPlanId(currentMealPlan._id);
        } else {
            setMealPlanId(null);
            setMealPlan(null);
        }
    }, [mealPlans, currentWeek]);

    // Update local state when meal plan data changes
    useEffect(() => {
        if (currentMealPlanData) {
            setMealPlan(currentMealPlanData);
        }
    }, [currentMealPlanData]);

    const handlePreviousWeek = () => {
        setCurrentWeek(prevWeek => subWeeks(prevWeek, 1));
    };

    const handleNextWeek = () => {
        setCurrentWeek(prevWeek => addWeeks(prevWeek, 1));
    };

    const handleOpenAddMealDialog = (date, mealType = '') => {
        setSelectedDate(date);
        setSelectedMealType(mealType);
        setSelectedRecipeId('');
        setMealNotes('');
        setEditingMealId(null);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleEditMeal = (meal) => {
        setSelectedDate(new Date(meal.date));
        setSelectedMealType(meal.mealType);
        setSelectedRecipeId(meal.recipe?._id || '');
        setMealNotes(meal.notes || '');
        setEditingMealId(meal._id);
        setOpenDialog(true);
    };

    const handleSaveMeal = async () => {
        try {
            if (!selectedRecipeId || !selectedMealType) {
                setError('Please select both a recipe and meal type');
                return;
            }

            // If we have no meal plan for this week, create one
            if (!mealPlan) {
                const startDate = currentWeek;
                const endDate = addDays(currentWeek, 6);

                const newMealPlan = await createMealPlan({
                    startDate,
                    endDate,
                    meals: [],
                    notes: `Meal plan for week of ${format(startDate, 'MMM d, yyyy')}`
                }).unwrap();

                setMealPlan(newMealPlan);
                setMealPlanId(newMealPlan._id);

                // Now add our meal to it
                await addMealToPlan({
                    id: newMealPlan._id,
                    mealData: {
                        date: selectedDate,
                        mealType: selectedMealType,
                        recipeId: selectedRecipeId,
                        notes: mealNotes
                    }
                }).unwrap();

                setSuccess('Meal added to plan');
                refetch();
            } else if (editingMealId) {
                // If editing existing meal, remove it first then add updated meal
                await removeMealFromPlan({
                    id: mealPlan._id,
                    mealId: editingMealId
                }).unwrap();

                await addMealToPlan({
                    id: mealPlan._id,
                    mealData: {
                        date: selectedDate,
                        mealType: selectedMealType,
                        recipeId: selectedRecipeId,
                        notes: mealNotes
                    }
                }).unwrap();

                setSuccess('Meal updated successfully');
                refetch();
            } else {
                // Add new meal to existing plan
                await addMealToPlan({
                    id: mealPlan._id,
                    mealData: {
                        date: selectedDate,
                        mealType: selectedMealType,
                        recipeId: selectedRecipeId,
                        notes: mealNotes
                    }
                }).unwrap();

                setSuccess('Meal added to plan');
                refetch();
            }

            setOpenDialog(false);
        } catch (error) {
            console.error('Error saving meal:', error);
            setError('Failed to save meal to plan');
        }
    };

    const handleDeleteMeal = async (mealId) => {
        if (!mealPlan || !mealId) return;

        if (window.confirm('Are you sure you want to remove this meal from the plan?')) {
            try {
                await removeMealFromPlan({
                    id: mealPlan._id,
                    mealId
                }).unwrap();

                setSuccess('Meal removed from plan');
                refetch();
            } catch (error) {
                console.error('Error deleting meal:', error);
                setError('Failed to remove meal from plan');
            }
        }
    };

    const handleGenerateShoppingList = async () => {
        if (!mealPlan) return;

        try {
            const shoppingList = await generateShoppingList({
                mealPlanId: mealPlan._id,
                name: `Shopping for ${format(currentWeek, 'MMM d')} - ${format(addDays(currentWeek, 6), 'MMM d, yyyy')}`
            }).unwrap();

            setSuccess('Shopping list generated successfully');
            // Redirect to the new shopping list
            navigate(`/shopping-lists/${shoppingList._id}`);
        } catch (error) {
            console.error('Error generating shopping list:', error);
            setError('Failed to generate shopping list');
        }
    };

    // Get meals for a specific day and type
    const getMealsForDayAndType = (date, mealType) => {
        if (!mealPlan || !mealPlan.meals.length) return [];

        return mealPlan.meals.filter(meal =>
            isSameDay(new Date(meal.date), date) && meal.mealType === mealType
        );
    };

    const isLoading = isCreating || isAddingMeal || isRemovingMeal || !recipes;

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4">Meal Planner</Typography>

                <Box>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<ShoppingCartIcon />}
                        onClick={handleGenerateShoppingList}
                        disabled={!mealPlan || isGeneratingList}
                        sx={{ mr: 1 }}
                    >
                        {isGeneratingList ? <CircularProgress size={24} /> : 'Generate Shopping List'}
                    </Button>
                </Box>
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

            {/* Week navigation */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={handlePreviousWeek}
                >
                    Previous Week
                </Button>

                <Typography variant="h6">
                    {format(currentWeek, 'MMM d')} - {format(addDays(currentWeek, 6), 'MMM d, yyyy')}
                </Typography>

                <Button
                    endIcon={<ArrowForwardIcon />}
                    onClick={handleNextWeek}
                >
                    Next Week
                </Button>
            </Box>

            {/* Weekly calendar grid */}
            <Grid container spacing={2}>
                {weekDays.map((day, index) => (
                    <Grid item xs={12} sm={6} md={index === 6 ? 12 : 6} lg={index === 6 ? 12 : 4} key={day.toString()}>
                        <Paper
                            sx={{
                                p: 2,
                                height: '100%',
                                bgcolor: index === 6 ? 'rgba(200, 200, 200, 0.1)' : 'white' // Highlight Sunday
                            }}
                            elevation={index === 6 ? 2 : 1}
                        >
                            <Typography variant="h6" sx={{ mb: 2, borderBottom: '1px solid #eee', pb: 1 }}>
                                {format(day, 'EEEE, MMM d')}
                            </Typography>

                            {mealTypes.map((mealType) => {
                                const mealsForThisType = getMealsForDayAndType(day, mealType.value);

                                return (
                                    <Box key={mealType.value} sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                {mealType.label}
                                            </Typography>
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() => handleOpenAddMealDialog(day, mealType.value)}
                                            >
                                                <AddIcon fontSize="small" />
                                            </IconButton>
                                        </Box>

                                        {mealsForThisType.length > 0 ? (
                                            mealsForThisType.map(meal => (
                                                <Card key={meal._id} variant="outlined" sx={{ mb: 1 }}>
                                                    <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Box sx={{ flexGrow: 1 }}>
                                                                <Typography variant="body2">
                                                                    {meal.recipe?.title || 'No recipe selected'}
                                                                </Typography>
                                                                {meal.notes && (
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        {meal.notes}
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                            <Box>
                                                                <IconButton size="small" onClick={() => handleEditMeal(meal)}>
                                                                    <EditIcon fontSize="small" />
                                                                </IconButton>
                                                                <IconButton size="small" color="error" onClick={() => handleDeleteMeal(meal._id)}>
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </Box>
                                                        </Box>
                                                    </CardContent>
                                                </Card>
                                            ))
                                        ) : (
                                            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                                No meals planned
                                            </Typography>
                                        )}
                                    </Box>
                                );
                            })}
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* Add/Edit Meal Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingMealId ? "Edit Meal" : "Add Meal to Plan"}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box>
                            <Typography variant="subtitle1">
                                {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : ''}
                            </Typography>
                        </Box>

                        <FormControl fullWidth margin="normal">
                            <InputLabel>Meal Type</InputLabel>
                            <Select
                                value={selectedMealType}
                                label="Meal Type"
                                onChange={e => setSelectedMealType(e.target.value)}
                            >
                                {mealTypes.map(type => (
                                    <MenuItem key={type.value} value={type.value}>
                                        {type.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth margin="normal">
                            <InputLabel>Recipe</InputLabel>
                            <Select
                                value={selectedRecipeId}
                                label="Recipe"
                                onChange={e => setSelectedRecipeId(e.target.value)}
                            >
                                <MenuItem value="">
                                    <em>None</em>
                                </MenuItem>
                                {Array.isArray(recipes) && recipes.map(recipe => (
                                    <MenuItem key={recipe._id} value={recipe._id}>
                                        {recipe.title}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            margin="normal"
                            label="Notes"
                            multiline
                            rows={2}
                            value={mealNotes}
                            onChange={e => setMealNotes(e.target.value)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSaveMeal} variant="contained" color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MealPlanner;
