import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, FieldArray } from 'formik';
import * as Yup from 'yup';
import {
    Box, Typography, Paper, TextField, Button,
    FormControl, InputLabel, Select, MenuItem,
    FormControlLabel, Switch, IconButton,
    Grid, Divider, FormHelperText, CircularProgress,
    Alert, Stepper, Step, StepLabel, StepContent,
    Card, CardContent, InputAdornment
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, ArrowBack, ArrowForward } from '@mui/icons-material';
import {
    useCreateRecipeMutation,
    useUploadRecipeImageMutation
} from '../services/api/recipesApiSlice';
import {
    useGetCategoriesQuery,
    useCreateCategoryMutation
} from '../services/api/categoriesApiSlice';

const basicInfoSchema = Yup.object().shape({
    title: Yup.string()
        .required('Recipe title is required')
        .max(100, 'Title cannot exceed 100 characters'),
    category: Yup.string()
        .test(
            'category-required',
            'Category is required',
            function (value) {
                return this.parent.useCustomCategory || Boolean(value);
            }
        ),
    useCustomCategory: Yup.boolean(),
    customCategory: Yup.string()
        .test(
            'custom-category-required',
            'Custom category name is required',
            function (value) {
                return !this.parent.useCustomCategory || Boolean(value);
            }
        ),
});

const timeInfoSchema = Yup.object().shape({
    prepTime: Yup.number()
        .required('Prep time is required')
        .min(1, 'Prep time must be at least 1 minute')
        .integer('Please enter a whole number'),
    cookTime: Yup.number()
        .required('Cook time is required')
        .min(0, 'Cook time must be at least 0 minutes')
        .integer('Please enter a whole number'),
});

const ingredientsSchema = Yup.object().shape({
    ingredients: Yup.array().of(
        Yup.object().shape({
            name: Yup.string().required('Ingredient name is required'),
            quantity: Yup.number().required('Quantity is required').positive('Must be positive'),
            unit: Yup.string().required('Unit is required')
        })
    ).min(1, 'Add at least one ingredient'),
});

const prepInstructionsSchema = Yup.object().shape({
    preheatOven: Yup.boolean(),
    ovenTemp: Yup.mixed()
        .when('preheatOven', {
            is: true,
            then: () => Yup.number()
                .typeError('Temperature must be a number')
                .required('Oven temperature is required')
                .positive('Must be a positive number'),
            otherwise: () => Yup.mixed().nullable()
        }),
    prepInstructions: Yup.array().of(
        Yup.object().shape({
            step: Yup.string().required('Step description is required')
        })
    ).min(1, 'Add at least one preparation step'),
});

const cookInstructionsSchema = Yup.object().shape({
    cookInstructions: Yup.array().of(
        Yup.object().shape({
            step: Yup.string().required('Step description is required')
        })
    ).min(1, 'Add at least one cooking step'),
});

const finalizeSchema = Yup.object().shape({
    isPrivate: Yup.boolean()
});

const unitOptions = [
    'tsp', 'tbsp', 'cup', 'oz', 'lb', 'g', 'kg', 'ml', 'l',
    'pinch', 'whole', 'slice', 'clove'
];

const steps = [
    'Basic Information',
    'Time Information',
    'Ingredients',
    'Preparation Instructions',
    'Cooking Instructions',
    'Review & Submit'
];

const CreateRecipe = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // RTK Query hooks
    const { data: categories = [], isLoading } = useGetCategoriesQuery();
    const [createRecipe, { isLoading: isCreating }] = useCreateRecipeMutation();
    const [createCategory, { isLoading: isCreatingCategory }] = useCreateCategoryMutation();
    const [uploadImage] = useUploadRecipeImageMutation();

    const initialValues = {
        title: '',
        category: '',
        useCustomCategory: false,
        customCategory: '',
        prepTime: 15,
        cookTime: 30,
        ingredients: [{ name: '', quantity: 1, unit: 'whole' }],
        preheatOven: false,
        ovenTemp: '',
        prepInstructions: [{ step: '' }],
        cookInstructions: [{ step: '' }],
        isPrivate: false
    };

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const getStepValidationSchema = (step) => {
        switch (step) {
            case 0:
                return basicInfoSchema;
            case 1:
                return timeInfoSchema;
            case 2:
                return ingredientsSchema;
            case 3:
                return prepInstructionsSchema;
            case 4:
                return cookInstructionsSchema;
            case 5:
                return finalizeSchema;
            default:
                return {};
        }
    };

    const formatInstructionsForSubmission = (values) => {
        let instructions = '';

        if (values.preheatOven) {
            instructions += `Preheat oven to ${values.ovenTemp}°F.\n\n`;
        }

        if (values.prepInstructions.length > 0) {
            instructions += "Preparation:\n";
            values.prepInstructions.forEach((item, index) => {
                instructions += `${index + 1}. ${item.step}\n`;
            });
            instructions += "\n";
        }

        if (values.cookInstructions.length > 0) {
            instructions += "Cooking:\n";
            values.cookInstructions.forEach((item, index) => {
                instructions += `${index + 1}. ${item.step}\n`;
            });
        }

        return instructions;
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            setError('');

            let categoryId = values.category;

            if (values.useCustomCategory && values.customCategory) {
                try {
                    const newCategory = await createCategory({
                        name: values.customCategory
                    }).unwrap();
                    categoryId = newCategory._id;
                } catch (categoryError) {
                    if (categoryError.data?.category?._id) {
                        categoryId = categoryError.data.category._id;
                    } else {
                        throw categoryError;
                    }
                }
            }

            const recipeData = {
                title: values.title,
                category: categoryId,
                ingredients: values.ingredients,
                instructions: formatInstructionsForSubmission(values),
                isPrivate: values.isPrivate,
                prepTime: values.prepTime,
                cookTime: values.cookTime
            };

            const newRecipe = await createRecipe(recipeData).unwrap();
            navigate(`/recipes/${newRecipe._id}`);
        } catch (err) {
            console.error('Error creating recipe:', err);
            setError(err.data?.message || 'Failed to create recipe');
            setSubmitting(false);
        }
    };

    const renderStepContent = (step, formProps) => {
        const { values, errors, touched, handleChange, setFieldValue } = formProps;

        switch (step) {
            case 0:
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
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
                        <Grid item xs={12}>
                            {!values.useCustomCategory ? (
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
                                        <Divider />
                                        <MenuItem value="custom" onClick={() => {
                                            setFieldValue('useCustomCategory', true);
                                            setFieldValue('category', '');
                                        }}>
                                            <em>Create new category...</em>
                                        </MenuItem>
                                    </Field>
                                    {touched.category && errors.category && (
                                        <FormHelperText>{errors.category}</FormHelperText>
                                    )}
                                </FormControl>
                            ) : (
                                <Box>
                                    <Field
                                        as={TextField}
                                        fullWidth
                                        label="Enter New Category"
                                        name="customCategory"
                                        variant="outlined"
                                        error={touched.customCategory && Boolean(errors.customCategory)}
                                        helperText={touched.customCategory && errors.customCategory}
                                    />
                                    <Button
                                        variant="text"
                                        size="small"
                                        onClick={() => {
                                            setFieldValue('useCustomCategory', false);
                                            setFieldValue('customCategory', '');
                                        }}
                                        sx={{ mt: 1 }}
                                    >
                                        Use existing category instead
                                    </Button>
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                );

            case 1:
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <Field
                                as={TextField}
                                fullWidth
                                type="number"
                                label="Preparation Time"
                                name="prepTime"
                                variant="outlined"
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">mins</InputAdornment>,
                                }}
                                error={touched.prepTime && Boolean(errors.prepTime)}
                                helperText={touched.prepTime && errors.prepTime}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Field
                                as={TextField}
                                fullWidth
                                type="number"
                                label="Cooking Time"
                                name="cookTime"
                                variant="outlined"
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">mins</InputAdornment>,
                                }}
                                error={touched.cookTime && Boolean(errors.cookTime)}
                                helperText={touched.cookTime && errors.cookTime}
                            />
                        </Grid>
                    </Grid>
                );

            case 2:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Add Ingredients
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
                    </Box>
                );

            case 3:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Preparation Instructions
                        </Typography>

                        <Box sx={{ mb: 3 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        name="preheatOven"
                                        checked={values.preheatOven}
                                        onChange={handleChange}
                                        color="primary"
                                    />
                                }
                                label="Preheat Oven?"
                            />

                            {values.preheatOven && (
                                <Field
                                    as={TextField}
                                    fullWidth
                                    type="number"
                                    label="Oven Temperature"
                                    name="ovenTemp"
                                    variant="outlined"
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">°F</InputAdornment>,
                                    }}
                                    sx={{ mt: 2 }}
                                    error={touched.ovenTemp && Boolean(errors.ovenTemp)}
                                    helperText={touched.ovenTemp && errors.ovenTemp}
                                />
                            )}
                        </Box>

                        <Typography variant="subtitle1" gutterBottom>
                            Preparation Steps
                        </Typography>

                        <FieldArray name="prepInstructions">
                            {({ push, remove }) => (
                                <>
                                    {values.prepInstructions.map((instruction, index) => (
                                        <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                                            <Grid item xs={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Typography variant="body1" fontWeight="bold">
                                                    {index + 1}.
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={10}>
                                                <Field
                                                    as={TextField}
                                                    fullWidth
                                                    label={`Step ${index + 1}`}
                                                    name={`prepInstructions.${index}.step`}
                                                    variant="outlined"
                                                    error={touched.prepInstructions?.[index]?.step && Boolean(errors.prepInstructions?.[index]?.step)}
                                                    helperText={touched.prepInstructions?.[index]?.step && errors.prepInstructions?.[index]?.step}
                                                />
                                            </Grid>
                                            <Grid item xs={1} sx={{ display: 'flex', alignItems: 'center' }}>
                                                {values.prepInstructions.length > 1 && (
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
                                        onClick={() => push({ step: '' })}
                                    >
                                        Add Step
                                    </Button>
                                </>
                            )}
                        </FieldArray>
                    </Box>
                );

            case 4:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Cooking Instructions
                        </Typography>

                        <FieldArray name="cookInstructions">
                            {({ push, remove }) => (
                                <>
                                    {values.cookInstructions.map((instruction, index) => (
                                        <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                                            <Grid item xs={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Typography variant="body1" fontWeight="bold">
                                                    {index + 1}.
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={10}>
                                                <Field
                                                    as={TextField}
                                                    fullWidth
                                                    label={`Step ${index + 1}`}
                                                    name={`cookInstructions.${index}.step`}
                                                    variant="outlined"
                                                    error={touched.cookInstructions?.[index]?.step && Boolean(errors.cookInstructions?.[index]?.step)}
                                                    helperText={touched.cookInstructions?.[index]?.step && errors.cookInstructions?.[index]?.step}
                                                />
                                            </Grid>
                                            <Grid item xs={1} sx={{ display: 'flex', alignItems: 'center' }}>
                                                {values.cookInstructions.length > 1 && (
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
                                        onClick={() => push({ step: '' })}
                                    >
                                        Add Step
                                    </Button>
                                </>
                            )}
                        </FieldArray>
                    </Box>
                );

            case 5:
                return (
                    <Box>
                        <Typography
                            variant="h6"
                            gutterBottom
                            color="primary"
                            sx={{
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                mb: 2,
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            Review Your Recipe Before Submission
                        </Typography>

                        <Alert severity="info" sx={{ mb: 3 }}>
                            Please carefully review all details of your recipe before clicking "Create Recipe" below.
                        </Alert>

                        <Card variant="outlined" sx={{ mb: 3, borderColor: 'primary.main' }}>
                            <CardContent>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            Basic Information
                                        </Typography>
                                        <Typography variant="body1">
                                            Title: {values.title}
                                        </Typography>
                                        <Typography variant="body1">
                                            Category: {values.useCustomCategory
                                                ? values.customCategory
                                                : categories.find(c => c._id === values.category)?.name || 'Unknown Category'}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            Time
                                        </Typography>
                                        <Typography variant="body1">
                                            Prep Time: {values.prepTime} minutes
                                        </Typography>
                                        <Typography variant="body1">
                                            Cook Time: {values.cookTime} minutes
                                        </Typography>
                                        <Typography variant="body1">
                                            Total Time: {Number(values.prepTime) + Number(values.cookTime)} minutes
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Divider sx={{ my: 2 }} />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            Ingredients
                                        </Typography>
                                        <ul>
                                            {values.ingredients.map((ingredient, index) => (
                                                <li key={index}>
                                                    {ingredient.quantity} {ingredient.unit} {ingredient.name}
                                                </li>
                                            ))}
                                        </ul>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Divider sx={{ my: 2 }} />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            Preparation Instructions
                                        </Typography>

                                        {values.preheatOven && (
                                            <Typography variant="body1" sx={{ mb: 1 }}>
                                                Preheat oven to {values.ovenTemp}°F.
                                            </Typography>
                                        )}

                                        <ol>
                                            {values.prepInstructions.map((instruction, index) => (
                                                <li key={index}>
                                                    {instruction.step}
                                                </li>
                                            ))}
                                        </ol>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            Cooking Instructions
                                        </Typography>
                                        <ol>
                                            {values.cookInstructions.map((instruction, index) => (
                                                <li key={index}>
                                                    {instruction.step}
                                                </li>
                                            ))}
                                        </ol>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>

                        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary">
                                Privacy Settings
                            </Typography>
                            <FormControlLabel
                                control={
                                    <Switch
                                        name="isPrivate"
                                        checked={values.isPrivate}
                                        onChange={handleChange}
                                        color="primary"
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography variant="body1">Private Recipe (visible only to your household)</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            When enabled, only members of your household can view this recipe.
                                        </Typography>
                                    </Box>
                                }
                            />
                        </Box>
                    </Box>
                );

            default:
                return <div>Unknown step</div>;
        }
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
            <Typography variant="h4" gutterBottom>
                Create New Recipe
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Paper elevation={2} sx={{ p: 3 }}>
                <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 4 }}>
                    {steps.map((label, index) => (
                        <Step key={label}>
                            <StepLabel
                                StepIconProps={{
                                    sx: {
                                        ...(index === activeStep && {
                                            '& .MuiStepIcon-root': {
                                                color: 'primary.main',
                                                fontWeight: 'bold'
                                            }
                                        }),
                                        ...(index === steps.length - 1 && {
                                            '& .MuiStepIcon-root': {
                                                color: 'primary.dark',
                                                fontSize: '1.5rem'
                                            }
                                        })
                                    }
                                }}
                            >
                                {index === steps.length - 1 ?
                                    <Typography variant="subtitle1" fontWeight="bold" color="primary">{label}</Typography> :
                                    label
                                }
                            </StepLabel>
                            <StepContent>
                                <Typography>
                                    {index === activeStep ?
                                        <Box component="span" fontWeight="bold" color="primary.main">{label}</Box> :
                                        label
                                    }
                                </Typography>
                            </StepContent>
                        </Step>
                    ))}
                </Stepper>
                <Formik
                    initialValues={initialValues}
                    validationSchema={getStepValidationSchema(activeStep)}
                    onSubmit={handleSubmit}
                    validateOnChange={false}
                    validateOnBlur={true}
                >
                    {(formProps) => {
                        const { isSubmitting, setTouched, errors, setFieldTouched, setFieldError } = formProps;

                        const handleValidationAndNext = async () => {
                            const schema = getStepValidationSchema(activeStep);

                            try {
                                if (activeStep === 3 && formProps.values.preheatOven) {
                                    setFieldTouched('ovenTemp', true);
                                    if (!formProps.values.ovenTemp) {
                                        setFieldError('ovenTemp', 'Oven temperature is required');
                                        return;
                                    }
                                }

                                let validationSuccess = true;
                                try {
                                    await schema.validate(formProps.values, { abortEarly: false });
                                } catch (err) {
                                    validationSuccess = false;
                                    console.log('Validation errors:', err);
                                    const touchedFields = {};
                                    if (err.inner && Array.isArray(err.inner)) {
                                        err.inner.forEach(error => {
                                            if (error.path) {
                                                touchedFields[error.path] = true;
                                                setFieldError(error.path, error.message);
                                            }
                                        });
                                        setTouched(touchedFields);
                                    } else if (err.path) {
                                        setFieldTouched(err.path, true);
                                        setFieldError(err.path, err.message);
                                    }
                                }

                                if (validationSuccess) {
                                    handleNext();
                                }
                            } catch (error) {
                                console.error('Unexpected validation error:', error);
                            }
                        };

                        return (
                            <Form>
                                <Box sx={{ mb: 4 }}>
                                    {renderStepContent(activeStep, formProps)}
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Button
                                        variant="outlined"
                                        onClick={activeStep === 0 ? () => navigate('/recipes') : handleBack}
                                        startIcon={activeStep === 0 ? null : <ArrowBack />}
                                    >
                                        {activeStep === 0 ? 'Cancel' : 'Back'}
                                    </Button>

                                    {activeStep === steps.length - 1 ? (
                                        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                                                By clicking "Create Recipe", your recipe will be saved and published according to your privacy settings.
                                            </Typography>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                color="primary"
                                                size="large"
                                                disabled={isSubmitting}
                                                sx={{
                                                    minWidth: 200,
                                                    py: 1.5,
                                                    fontSize: '1.1rem'
                                                }}
                                            >
                                                {isSubmitting ? <CircularProgress size={24} /> : 'Create Recipe'}
                                            </Button>
                                        </Box>
                                    ) : (
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={handleValidationAndNext}
                                            endIcon={<ArrowForward />}
                                            sx={{ px: 4, py: 1 }}
                                        >
                                            Next
                                        </Button>
                                    )}
                                </Box>
                            </Form>
                        );
                    }}
                </Formik>
            </Paper>
        </Box>
    );
};

export default CreateRecipe;
