import { api } from './apiSlice';

export const userApiSlice = api.injectEndpoints({
    endpoints: (builder) => ({
        updateUserProfile: builder.mutation({
            query: (profileData) => ({
                url: '/auth/update-profile',
                method: 'PUT',
                body: profileData,
            }),
            invalidatesTags: ['CurrentUser']
        }),

        changePassword: builder.mutation({
            query: (passwordData) => ({
                url: '/auth/change-password',
                method: 'PUT',
                body: passwordData,
            })
        }),

        deleteAccount: builder.mutation({
            query: () => ({
                url: '/auth/delete-account',
                method: 'DELETE',
            })
        }),

        forgotPassword: builder.mutation({
            query: (email) => ({
                url: '/auth/forgot-password',
                method: 'POST',
                body: { email },
            }),
        }),

        resetPassword: builder.mutation({
            query: ({ token, password }) => ({
                url: `/auth/reset-password/${token}`,
                method: 'POST',
                body: { password },
            }),
        }),
    }),
});

export const {
    useUpdateUserProfileMutation,
    useChangePasswordMutation,
    useDeleteAccountMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,
} = userApiSlice;
