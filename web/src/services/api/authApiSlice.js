import { api } from './apiSlice';

export const authApiSlice = api.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: {
                    email: credentials?.email || '',
                    password: credentials?.password || ''
                }
            }),
            // Save token to localStorage on successful login
            onQueryStarted: async (_, { queryFulfilled }) => {
                try {
                    const { data } = await queryFulfilled;
                    if (data.token) {
                        localStorage.setItem('token', data.token);
                    }
                } catch (err) {
                    // Handle error if needed
                }
            }
        }),

        register: builder.mutation({
            query: (userData) => ({
                url: '/auth/register',
                method: 'POST',
                body: userData
            }),
            // Save token to localStorage on successful registration
            onQueryStarted: async (_, { queryFulfilled }) => {
                try {
                    const { data } = await queryFulfilled;
                    if (data.token) {
                        localStorage.setItem('token', data.token);
                    }
                } catch (err) {
                    // Handle error if needed
                }
            }
        }),

        getCurrentUser: builder.query({
            query: () => '/auth/me',
            providesTags: ['CurrentUser']
        }),

        updateProfile: builder.mutation({
            query: (userData) => ({
                url: '/auth/update-profile',
                method: 'PUT',
                body: userData
            }),
            invalidatesTags: ['CurrentUser']
        })
    })
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useGetCurrentUserQuery,
    useUpdateProfileMutation
} = authApiSlice;

// Helper function for logout (no API call needed)
export const logout = () => {
    localStorage.removeItem('token');
    // Optionally invalidate cache or dispatch other actions here
    return true;
};
