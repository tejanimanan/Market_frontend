import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface Script {
  key: string;
  id: string;
  name: string;
  current_rate: number;
  status: boolean | string;
  high_value: number;
  low_value: number;
  volume: number;
  closing_price: number;
  type:string
}

interface ScriptState {
  scripts: Script[];
  selectedScript: Script | null;
  loading: boolean;
  error: string | null;
}

const initialState: ScriptState = {
  scripts: [],
  selectedScript: null,
  loading: false,
  error: null,
};

const scriptSlice = createSlice({
  name: 'script',
  initialState,
  reducers: {
    setScripts: (state, action: PayloadAction<Script[]>) => {
      state.scripts = action.payload;
    },
    setSelectedScript: (state, action: PayloadAction<Script | null>) => {
      state.selectedScript = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    updateScriptPrice: (state, action: PayloadAction<{ id: string; current_rate: number }>) => {
      const script = state.scripts.find(s => s.id === action.payload.id);
      if (script) {
        script.current_rate = action.payload.current_rate;
      }
    },
  },
});

export const { 
  setScripts, 
  setSelectedScript, 
  setLoading, 
  setError, 
  updateScriptPrice 
} = scriptSlice.actions;

export default scriptSlice.reducer; 