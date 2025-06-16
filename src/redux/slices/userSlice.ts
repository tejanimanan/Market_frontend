import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface UserData {
  key: string;
  uid:number;
  name: string;
  email: string;
  contact: string;
  role: string;
  status: string;
  password?: string;
}

interface UserState {
  isAuthenticated: boolean;
  userData: {
    id?: string;
    uid?:number;
    name?: string;
    email?: string;
    role?: string;
  } | null;
  users: UserData[];
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  isAuthenticated: false,
  userData: null,
  users: [],
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState['userData']>) => {
      state.userData = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setUsers: (state, action: PayloadAction<UserData[]>) => {
      state.users = action.payload;
    },
    addUser: (state, action: PayloadAction<UserData>) => {
      state.users.push(action.payload);
    },
    updateUser: (state, action: PayloadAction<UserData>) => {
      const index = state.users.findIndex(user => user.key === action.payload.key);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
    removeUser: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter(user => user.key !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    logout: (state) => {
      state.userData = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
});

export const { 
  setUser, 
  setUsers, 
  addUser, 
  updateUser, 
  removeUser, 
  setLoading, 
  setError, 
  logout 
} = userSlice.actions;

export default userSlice.reducer; 