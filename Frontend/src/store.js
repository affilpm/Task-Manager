// store.js
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import taskSlicereducer from './slices/taskSlice';
import categoryreducer from './slices/categorySlice'
import themereducer from './slices/themeSlice'

// Root reducer
const rootReducer = combineReducers({
    tasks: taskSlicereducer,
    categories: categoryreducer,
    theme: themereducer,




});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: [], 

};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer, // Use the persisted root reducer
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredPaths: ['user.image', 'admin.password'], // Ignore sensitive paths
      },
    }),
});

export const persistor = persistStore(store);
export default store;