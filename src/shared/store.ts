import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  version: string;
}

const initialState: AppState = {
  version: '1.0.0',
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setVersion: (state, action: PayloadAction<string>) => {
      state.version = action.payload;
    },
  },
});

export const { setVersion } = appSlice.actions;

export const store = configureStore({
  reducer: {
    app: appSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 