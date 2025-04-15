import { api } from './apiSlice';

export const invitationsApiSlice = api.injectEndpoints({
    endpoints: (builder) => ({
        // Get user's invitations
        getUserInvitations: builder.query({
            query: () => '/invitations',
            providesTags: ['Invitations']
        }),

        // Verify invitation by token
        verifyInvitation: builder.query({
            query: (token) => `/invitations/verify/${token}`,
        }),

        // Accept invitation
        acceptInvitation: builder.mutation({
            query: (token) => ({
                url: `/invitations/accept/${token}`,
                method: 'POST'
            }),
            invalidatesTags: ['Household', 'Invitations']
        }),

        // Send invitation
        sendInvitation: builder.mutation({
            query: (email) => ({
                url: '/invitations',
                method: 'POST',
                body: { email }
            }),
            invalidatesTags: ['Invitations']
        }),

        // Resend invitation
        resendInvitation: builder.mutation({
            query: (invitationId) => ({
                url: `/invitations/${invitationId}/resend`,
                method: 'POST'
            }),
            invalidatesTags: ['Invitations']
        })
    }),
});

export const {
    useGetUserInvitationsQuery,
    useVerifyInvitationQuery,
    useAcceptInvitationMutation,
    useSendInvitationMutation,
    useResendInvitationMutation
} = invitationsApiSlice;
