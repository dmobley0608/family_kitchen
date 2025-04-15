import { api } from './apiSlice';

export const shoppingListsApiSlice = api.injectEndpoints({
    endpoints: (builder) => ({
        // Get all shopping lists
        getShoppingLists: builder.query({
            query: () => '/shopping-lists',
            providesTags: ['ShoppingLists']
        }),

        // Get a single shopping list by ID
        getShoppingListById: builder.query({
            query: (id) => `/shopping-lists/${id}`,
            providesTags: (result, error, id) => [{ type: 'ShoppingLists', id }]
        }),

        // Create a new shopping list
        createShoppingList: builder.mutation({
            query: (shoppingListData) => ({
                url: '/shopping-lists',
                method: 'POST',
                body: shoppingListData,
            }),
            invalidatesTags: ['ShoppingLists']
        }),

        // Update a shopping list
        updateShoppingList: builder.mutation({
            query: ({ id, ...updateData }) => ({
                url: `/shopping-lists/${id}`,
                method: 'PUT',
                body: updateData,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'ShoppingLists', id },
                'ShoppingLists'
            ]
        }),

        // Delete a shopping list
        deleteShoppingList: builder.mutation({
            query: (id) => ({
                url: `/shopping-lists/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['ShoppingLists']
        }),

        // Add item to shopping list
        addItemToList: builder.mutation({
            query: ({ id, itemData }) => ({
                url: `/shopping-lists/${id}/items`,
                method: 'POST',
                body: itemData,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'ShoppingLists', id },
                'ShoppingLists'
            ]
        }),

        // Remove item from shopping list
        removeItemFromList: builder.mutation({
            query: ({ id, itemId }) => ({
                url: `/shopping-lists/${id}/items/${itemId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'ShoppingLists', id },
                'ShoppingLists'
            ]
        }),

        // Toggle item purchased status
        toggleItemPurchased: builder.mutation({
            query: ({ id, itemId }) => ({
                url: `/shopping-lists/${id}/items/${itemId}/toggle`,
                method: 'PATCH',
                body: {},
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'ShoppingLists', id },
                'ShoppingLists'
            ]
        }),

        // Generate shopping list from meal plan
        generateFromMealPlan: builder.mutation({
            query: (mealPlanData) => ({
                url: '/shopping-lists/generate-from-meal-plan',
                method: 'POST',
                body: mealPlanData,
            }),
            invalidatesTags: ['ShoppingLists']
        }),
    }),
});

export const {
    useGetShoppingListsQuery,
    useGetShoppingListByIdQuery,
    useCreateShoppingListMutation,
    useUpdateShoppingListMutation,
    useDeleteShoppingListMutation,
    useAddItemToListMutation,
    useRemoveItemFromListMutation,
    useToggleItemPurchasedMutation,
    useGenerateFromMealPlanMutation,
} = shoppingListsApiSlice;
