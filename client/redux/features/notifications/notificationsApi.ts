import { apiSlice } from "../api/apiSlice";

export const notificationsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAllNotifications: builder.query({
            query: () => ({
                url: "get-allNotifications",
                method: "GET",
                credentials: "include" as const,
            }),
        }),
        updateNotificationsStatus: builder.mutation({
            query: (id) => ({
                url: `/update-notification/${id}`,
                method: "PUT",
                credentials: "include" as const,
            }),
        }),
    }),
});

export const { useGetAllNotificationsQuery, useUpdateNotificationsStatusMutation } = notificationsApi;