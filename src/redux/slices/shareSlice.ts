import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: number;
  name: string;
  email?: string;
}

export interface Script {
  id: number;
  name: string;
}

export interface ShareData {
  key: string;
  user: User;
  script: Script;
  qty: number;
  type: string;
  price: number;
  position: string;
  create_date: string;
  updated_date: string;
}

export interface ShareFormData {
  key?: string;
  user_id: number;
  script_id: number;
  qty: number;
  type: string;
  price: number;
  position: string;
}

interface ShareState {
  shares: ShareData[];
  selectedShare: ShareData | null;
  loading: boolean;
  error: string | null;
}

const initialState: ShareState = {
  shares: [],
  selectedShare: null,
  loading: false,
  error: null
};

const shareSlice = createSlice({
  name: 'share',
  initialState,
  reducers: {
    setShares: (state, action: PayloadAction<ShareData[]>) => {
      state.shares = action.payload;
    },
    addShare: (state, action: PayloadAction<ShareData>) => {
      state.shares.push(action.payload);
    },
    updateShare: (state, action: PayloadAction<ShareData>) => {
      const index = state.shares.findIndex(share => share.key === action.payload.key);
      if (index !== -1) {
        state.shares[index] = action.payload;
      }
    },
    deleteShare: (state, action: PayloadAction<string>) => {
      state.shares = state.shares.filter(share => share.key !== action.payload);
    },
    setSelectedShare: (state, action: PayloadAction<ShareData | null>) => {
      state.selectedShare = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearShareState: (state) => {
      state.selectedShare = null;
      state.error = null;
    },
  },
});

export const { 
  setShares, 
  addShare, 
  updateShare, 
  deleteShare, 
  setSelectedShare,
  setLoading, 
  setError,
  clearShareState
} = shareSlice.actions;

export default shareSlice.reducer; 