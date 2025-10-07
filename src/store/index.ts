import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth.slice';
import userReducer from './user.slice';
import groupReducer from './group.slice';
import permissionReducer from './permission.slice';
import menuReducer from './menu.slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    groups: groupReducer,
    permissions: permissionReducer,
    menus: menuReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;