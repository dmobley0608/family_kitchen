import { api } from './apiSlice';

export const householdApiSlice = api.injectEndpoints({
    endpoints: (builder) => ({
        getHouseholdDetails: builder.query({
            query: () => '/households',
            providesTags: ['Household']
        }),

        updateHouseholdName: builder.mutation({
            query: (name) => ({
                url: '/households',
                method: 'PUT',
                body: { name },
            }),
            invalidatesTags: ['Household']
        }),

        generateInviteCode: builder.mutation({
            query: () => ({
                url: '/households/invite',
                method: 'POST',
            }),
            invalidatesTags: ['Household', 'Invitations']
        }),

        joinHousehold: builder.mutation({
            query: (inviteCode) => ({
                url: '/households/join',
                method: 'POST',
                body: { inviteCode },
            }),
            invalidatesTags: ['Household']
        }),

        removeMember: builder.mutation({
            query: (userId) => ({
                url: `/households/members/${userId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Household']
        }),
    }),
});

export const {
    useGetHouseholdDetailsQuery,
    useUpdateHouseholdNameMutation,
    useGenerateInviteCodeMutation,
    useJoinHouseholdMutation,
    useRemoveMemberMutation,
} = householdApiSlice;
