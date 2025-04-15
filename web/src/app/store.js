import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from '../services/api/apiSlice';

export const store = configureStore({
    reducer: {
        // Add the API reducer to the store
        [api.reducerPath]: api.reducer,
    },
    // Adding the api middleware enables caching, invalidation, polling, and other features
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(api.middleware),
});

// Optional, but required for refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);
