import { createSlice } from '@reduxjs/toolkit';

const categorySlice = createSlice({
  name: 'categories',
  initialState: {
    categories: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    setCategories(state, action) {
      state.categories = action.payload;
      state.status = 'succeeded';
    },
    addCategory(state, action) {
      state.categories.push(action.payload);
    },
    updateCategory(state, action) {
      const index = state.categories.findIndex(cat => cat.id === action.payload.id);
      if (index !== -1) {
        state.categories[index] = action.payload;
      }
    },
    deleteCategory(state, action) {
      state.categories = state.categories.filter(cat => cat.id !== action.payload);
    },
    setCategoryLoading(state) {
      state.status = 'loading';
    },
    setCategoryError(state, action) {
      state.status = 'failed';
      state.error = action.payload;
    },
  },
});

export const {
  setCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  setCategoryLoading,
  setCategoryError,
} = categorySlice.actions;

export default categorySlice.reducer;