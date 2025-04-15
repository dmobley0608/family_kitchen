import { api } from './apiSlice';

export const mealPlansApiSlice = api.injectEndpoints({
    endpoints: (builder) => ({
        // Get all meal plans
        getMealPlans: builder.query({
            query: () => '/meal-plans',
            providesTags: ['MealPlans']
        }),

        // Get a single meal plan by ID
        getMealPlanById: builder.query({
            query: (id) => `/meal-plans/${id}`,
            providesTags: (result, error, id) => [{ type: 'MealPlans', id }]
        }),

        // Create a new meal plan
        createMealPlan: builder.mutation({
            query: (mealPlanData) => ({
                url: '/meal-plans',
                method: 'POST',
                body: mealPlanData,
            }),
            invalidatesTags: ['MealPlans']
        }),

        // Update a meal plan
        updateMealPlan: builder.mutation({
            query: ({ id, ...updateData }) => ({
                url: `/meal-plans/${id}`,
                method: 'PUT',
                body: updateData,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'MealPlans', id },
                'MealPlans'
            ]
        }),

        // Delete a meal plan
        deleteMealPlan: builder.mutation({
            query: (id) => ({
                url: `/meal-plans/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['MealPlans']
        }),

        // Add a meal to a meal plan
        addMealToPlan: builder.mutation({
            query: ({ id, mealData }) => ({
                url: `/meal-plans/${id}/meals`,
                method: 'POST',
                body: mealData,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'MealPlans', id },
                'MealPlans'
            ]
        }),

        // Remove a meal from a meal plan
        removeMealFromPlan: builder.mutation({
            query: ({ id, mealId }) => ({
                url: `/meal-plans/${id}/meals/${mealId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'MealPlans', id },
                'MealPlans'
            ]
        }),
    }),
});

export const {
    useGetMealPlansQuery,
    useGetMealPlanByIdQuery,
    useCreateMealPlanMutation,
    useUpdateMealPlanMutation,
    useDeleteMealPlanMutation,
    useAddMealToPlanMutation,
    useRemoveMealFromPlanMutation,
} = mealPlansApiSlice;
