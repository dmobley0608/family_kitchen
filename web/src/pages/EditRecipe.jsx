import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, FieldArray } from 'formik';
import * as Yup from 'yup';
import {
    Box, Typography, Paper, TextField, Button,
    FormControl, InputLabel, Select, MenuItem,
    FormControlLabel, Switch, IconButton,
    Grid, Divider, FormHelperText, CircularProgress,
    Alert
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import * as recipeService from '../services/recipeService';
import * as categoryService from '../services/categoryService';
import ImageUploader from '../components/ImageUploader';

const validationSchema = Yup.object({
    title: Yup.string()
        .required('Title is required')
        .max(100, 'Title cannot exceed 100 characters'),
    category: Yup.string()
        .required('Category is required'),
    ingredients: Yup.array().of(
        Yup.object().shape({
            name: Yup.string().required('Ingredient name is required'),
            quantity: Yup.number().required('Quantity is required').positive('Must be positive'),
            unit: Yup.string().required('Unit is required')
        })
    ).min(1, 'Add at least one ingredient'),
    instructions: Yup.string()
        .required('Instructions are required')
        .min(10, 'Instructions should be more detailed'),
    isPrivate: Yup.boolean()
});

const unitOptions = [
    'tsp', 'tbsp', 'cup', 'oz', 'lb', 'g', 'kg', 'ml', 'l',
    'pinch', 'whole', 'slice', 'clove'
];

const EditRecipe = () => {
    const { id } = useParams();
    const [recipe, setRecipe] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [recipeData, categoriesData] = await Promise.all([
                    recipeService.getRecipeById(id),
                    categoryService.getAllCategories()
                ]);

                setRecipe(recipeData);
                setCategories(categoriesData);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError(error.response?.data?.message || 'Failed to load recipe data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            setError('');
            await recipeService.updateRecipe(id, values);
            navigate(`/recipes/${id}`);
        } catch (error) {
            console.error('Error updating recipe:', error);
            setError(error.response?.data?.message || 'Failed to update recipe');
            setSubmitting(false);
        }
    };

    const getImageUrl = (recipe) => {
        if (recipe?.image?.url) {
            if (recipe.image.url.startsWith('/uploads/')) {
                return `${import.meta.env.VITE_API_URL.split('/api')[0]}${recipe.image.url}`;
            }
            return recipe.image.url;
        }
        return null;
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!recipe) {
        return (
            <Box sx={{ p: 4 }}>
                <Alert severity="error">Recipe not found</Alert>
                <Button
                    onClick={() => navigate('/recipes')}
                    sx={{ mt: 2 }}
                >
                    Back to Recipes
                </Button>
            </Box>
        );
    }

    // Format initial values
    const initialValues = {
        title: recipe.title,
        category: recipe.category?._id,
        ingredients: recipe.ingredients.map(item => ({
            name: item.ingredient?.name,
            quantity: item.quantity,
            unit: item.unit
        })),
        instructions: recipe.instructions,
        isPrivate: recipe.isPrivate,
        image: recipe.image ? getImageUrl(recipe) : null,
        prepTime: recipe.prepTime || 0,
        cookTime: recipe.cookTime || 0
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Edit Recipe
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Paper elevation={2} sx={{ p: 3 }}>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ values, errors, touched, isSubmitting, handleChange, setFieldValue }) => (
                        <Form>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={8}>
                                    <Field
                                        as={TextField}
                                        fullWidth
                                        label="Recipe Title"
                                        name="title"
                                        variant="outlined"
                                        error={touched.title && Boolean(errors.title)}
                                        helperText={touched.title && errors.title}
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <FormControl fullWidth error={touched.category && Boolean(errors.category)}>
                                        <InputLabel>Category</InputLabel>
                                        <Field
                                            as={Select}
                                            name="category"
                                            label="Category"
                                        >
                                            {categories.map((category) => (
                                                <MenuItem key={category._id} value={category._id}>
                                                    {category.name}
                                                </MenuItem>
                                            ))}
                                        </Field>
                                        {touched.category && errors.category && (
                                            <FormHelperText>{errors.category}</FormHelperText>
                                        )}
                                    </FormControl>
                                </Grid>

                                {/* Add Image Upload Section */}
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="h6" gutterBottom>
                                        Recipe Image
                                    </Typography>
                                    <ImageUploader
                                        value={values.image}
                                        onChange={(file, error) => {
                                            setFieldValue('image', file);
                                            if (error) {
                                                console.error('Image upload error:', error);
                                            }
                                        }}
                                        error={touched.image && errors.image}
                                    />
                                </Grid>

                                {/* Prep and Cook Time */}
                                <Grid item xs={12} sm={6}>
                                    <Field
                                        as={TextField}
                                        fullWidth
                                        type="number"
                                        label="Preparation Time (minutes)"
                                        name="prepTime"
                                        variant="outlined"
                                        InputProps={{ inputProps: { min: 0 } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Field
                                        as={TextField}
                                        fullWidth
                                        type="number"
                                        label="Cooking Time (minutes)"
                                        name="cookTime"
                                        variant="outlined"
                                        InputProps={{ inputProps: { min: 0 } }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="h6" gutterBottom>
                                        Ingredients
                                    </Typography>

                                    <FieldArray name="ingredients">
                                        {({ push, remove }) => (
                                            <>
                                                {values.ingredients.map((ingredient, index) => (
                                                    <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                                                        <Grid item xs={12} sm={5}>
                                                            <Field
                                                                as={TextField}
                                                                fullWidth
                                                                label="Ingredient Name"
                                                                name={`ingredients.${index}.name`}
                                                                variant="outlined"
                                                                error={touched.ingredients?.[index]?.name && Boolean(errors.ingredients?.[index]?.name)}
                                                                helperText={touched.ingredients?.[index]?.name && errors.ingredients?.[index]?.name}
                                                            />
                                                        </Grid>
                                                        <Grid item xs={6} sm={3}>
                                                            <Field
                                                                as={TextField}
                                                                fullWidth
                                                                type="number"
                                                                label="Quantity"
                                                                name={`ingredients.${index}.quantity`}
                                                                variant="outlined"
                                                                inputProps={{ min: 0, step: "0.01" }}
                                                                error={touched.ingredients?.[index]?.quantity && Boolean(errors.ingredients?.[index]?.quantity)}
                                                                helperText={touched.ingredients?.[index]?.quantity && errors.ingredients?.[index]?.quantity}
                                                            />
                                                        </Grid>
                                                        <Grid item xs={6} sm={3}>
                                                            <FormControl fullWidth error={touched.ingredients?.[index]?.unit && Boolean(errors.ingredients?.[index]?.unit)}>
                                                                <InputLabel>Unit</InputLabel>
                                                                <Field
                                                                    as={Select}
                                                                    name={`ingredients.${index}.unit`}
                                                                    label="Unit"
                                                                >
                                                                    {unitOptions.map((unit) => (
                                                                        <MenuItem key={unit} value={unit}>
                                                                            {unit}
                                                                        </MenuItem>
                                                                    ))}
                                                                </Field>
                                                                {touched.ingredients?.[index]?.unit && errors.ingredients?.[index]?.unit && (
                                                                    <FormHelperText>{errors.ingredients?.[index]?.unit}</FormHelperText>
                                                                )}
                                                            </FormControl>
                                                        </Grid>
                                                        <Grid item xs={12} sm={1} sx={{ display: 'flex', alignItems: 'center' }}>
                                                            {values.ingredients.length > 1 && (
                                                                <IconButton onClick={() => remove(index)} color="error">
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            )}
                                                        </Grid>
                                                    </Grid>
                                                ))}
                                                <Button
                                                    type="button"
                                                    startIcon={<AddIcon />}
                                                    onClick={() => push({ name: '', quantity: 1, unit: 'whole' })}
                                                >
                                                    Add Ingredient
                                                </Button>
                                            </>
                                        )}
                                    </FieldArray>
                                </Grid>

                                <Grid item xs={12}>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="h6" gutterBottom>
                                        Instructions
                                    </Typography>
                                    <Field
                                        as={TextField}
                                        fullWidth
                                        multiline
                                        rows={6}
                                        label="Recipe Instructions"
                                        name="instructions"
                                        variant="outlined"
                                        error={touched.instructions && Boolean(errors.instructions)}
                                        helperText={touched.instructions && errors.instructions}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                name="isPrivate"
                                                checked={values.isPrivate}
                                                onChange={handleChange}
                                                color="primary"
                                            />
                                        }
                                        label="Private Recipe (visible only to your household)"
                                    />
                                </Grid>

                                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => navigate(`/recipes/${id}`)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? <CircularProgress size={24} /> : 'Update Recipe'}
                                    </Button>
                                </Grid>
                            </Grid>
                        </Form>
                    )}
                </Formik>
            </Paper>
        </Box>
    );
};

export default EditRecipe;
