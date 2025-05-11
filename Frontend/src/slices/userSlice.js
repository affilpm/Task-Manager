import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  fullName: '',
  email: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setFullName: (state, action) => {
      state.fullName = action.payload;
    },
    setEmail: (state, action) => {
      state.email = action.payload;
    },
    setUser: (state, action) => {
      state.fullName = action.payload.fullName;
      state.email = action.payload.email;
    },
    clearUser: (state) => {
      state.fullName = '';
      state.email = '';
    },
  },
});

export const { setFullName, setEmail, setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
