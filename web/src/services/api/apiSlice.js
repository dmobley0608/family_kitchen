import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define our base API
export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_URL || 'https://family-kitchen.tccs.tech/api',
        prepareHeaders: (headers) => {
            // Get the token from localStorage
            const token = localStorage.getItem('token');

            // If we have a token, add it to the headers
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }

            return headers;
        },
    }),
    // The types of data we'll be fetching
    tagTypes: [
        'Recipes',
        'Recipe',
        'Categories',
        'MealPlans',
        'ShoppingLists',
        'Household',
        'Invitations'
    ],
    // Empty endpoints initially - we'll inject them from individual slices
    endpoints: () => ({}),
});
