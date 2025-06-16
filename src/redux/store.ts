import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import scriptReducer from './slices/scriptSlice';
import shareReducer from './slices/shareSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    script: scriptReducer,
    share: shareReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 