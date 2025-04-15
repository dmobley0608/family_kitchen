import { api } from './apiSlice';

// Inject the recipes endpoints into the main API
export const recipesApiSlice = api.injectEndpoints({
    endpoints: (builder) => ({
        // Get all recipes
        getRecipes: builder.query({
            query: () => '/recipes',
            providesTags: ['Recipes']
        }),

        // Get a single recipe by ID
        getRecipeById: builder.query({
            query: (id) => `/recipes/${id}`,
            providesTags: (result, error, id) => [{ type: 'Recipe', id }]
        }),

        // Create a new recipe
        createRecipe: builder.mutation({
            query: (recipeData) => ({
                url: '/recipes',
                method: 'POST',
                body: recipeData,
            }),
            invalidatesTags: ['Recipes']
        }),

        // Update a recipe
        updateRecipe: builder.mutation({
            query: ({ id, ...recipeData }) => ({
                url: `/recipes/${id}`,
                method: 'PUT',
                body: recipeData,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Recipe', id },
                'Recipes'
            ]
        }),

        // Delete a recipe
        deleteRecipe: builder.mutation({
            query: (id) => ({
                url: `/recipes/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Recipes']
        }),

        // Upload recipe image
        uploadRecipeImage: builder.mutation({
            query: (formData) => ({
                url: '/recipes/upload',
                method: 'POST',
                body: formData,
                formData: true,
            }),
        }),
    }),
    overrideExisting: false,
});

// Export auto-generated hooks
export const {
    useGetRecipesQuery,
    useGetRecipeByIdQuery,
    useCreateRecipeMutation,
    useUpdateRecipeMutation,
    useDeleteRecipeMutation,
    useUploadRecipeImageMutation,
} = recipesApiSlice;
