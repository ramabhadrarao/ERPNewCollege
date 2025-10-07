import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../services/user.service';

interface User {
  id: number;
  username: string;
  email: string;
  isActive: boolean;
  lastLogin?: Date;
  groups: any[];
}

interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  loading: false,
  error: null
};

export const fetchUsers = createAsyncThunk(
  'users/fetchAll',
  async () => {
    return await userService.getAll();
  }
);

export const createUser = createAsyncThunk(
  'users/create',
  async (userData: Partial<User>) => {
    return await userService.create(userData);
  }
);

export const updateUser = createAsyncThunk(
  'users/update',
  async ({ id, data }: { id: number; data: Partial<User> }) => {
    return await userService.update(id, data);
  }
);

export const deleteUser = createAsyncThunk(
  'users/delete',
  async (id: number) => {
    await userService.delete(id);
    return id;
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch users';
      })
      // Create User
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.push(action.payload);
      })
      // Update User
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      // Delete User
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(user => user.id !== action.payload);
      });
  }
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;