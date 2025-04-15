import { api } from './apiSlice';

export const categoriesApiSlice = api.injectEndpoints({
    endpoints: (builder) => ({
        // Get all categories
        getCategories: builder.query({
            query: () => '/categories',
            providesTags: ['Categories']
        }),

        // Get a single category by ID
        getCategoryById: builder.query({
            query: (id) => `/categories/${id}`,
            providesTags: (result, error, id) => [{ type: 'Categories', id }]
        }),

        // Create a new category
        createCategory: builder.mutation({
            query: (categoryData) => ({
                url: '/categories',
                method: 'POST',
                body: categoryData,
            }),
            invalidatesTags: ['Categories']
        }),
    }),
});

export const {
    useGetCategoriesQuery,
    useGetCategoryByIdQuery,
    useCreateCategoryMutation,
} = categoriesApiSlice;
