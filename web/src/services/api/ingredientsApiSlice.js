import { api } from './apiSlice';

export const ingredientsApiSlice = api.injectEndpoints({
    endpoints: (builder) => ({
        // Get all ingredients
        getAllIngredients: builder.query({
            query: () => '/ingredients',
            providesTags: ['Ingredients']
        }),

        // Get ingredient by ID
        getIngredientById: builder.query({
            query: (id) => `/ingredients/${id}`,
            providesTags: (result, error, id) => [{ type: 'Ingredients', id }]
        }),

        // Create a new ingredient
        createIngredient: builder.mutation({
            query: (ingredientData) => ({
                url: '/ingredients',
                method: 'POST',
                body: ingredientData,
            }),
            invalidatesTags: ['Ingredients']
        }),
    }),
});

export const {
    useGetAllIngredientsQuery,
    useGetIngredientByIdQuery,
    useCreateIngredientMutation,
} = ingredientsApiSlice;
