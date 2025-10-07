import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import permissionService from '../services/permission.service';

interface Permission {
  id: number;
  resource: string;
  action: string;
  description?: string;
}

interface PermissionState {
  permissions: Permission[];
  loading: boolean;
  error: string | null;
}

const initialState: PermissionState = {
  permissions: [],
  loading: false,
  error: null
};

export const fetchPermissions = createAsyncThunk(
  'permissions/fetchAll',
  async () => {
    return await permissionService.getAll();
  }
);

export const createPermission = createAsyncThunk(
  'permissions/create',
  async (permissionData: { resource: string; action: string; description?: string }) => {
    return await permissionService.create(permissionData);
  }
);

export const updatePermission = createAsyncThunk(
  'permissions/update',
  async ({ id, data }: { id: number; data: { resource: string; action: string; description?: string } }) => {
    return await permissionService.update(id, data);
  }
);

export const deletePermission = createAsyncThunk(
  'permissions/delete',
  async (id: number) => {
    await permissionService.delete(id);
    return id;
  }
);

export const bulkCreatePermissions = createAsyncThunk(
  'permissions/bulkCreate',
  async (permissions: Array<{ resource: string; action: string; description?: string }>) => {
    return await permissionService.bulkCreate(permissions);
  }
);

const permissionSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Permissions
      .addCase(fetchPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.permissions = action.payload;
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch permissions';
      })
      // Create Permission
      .addCase(createPermission.fulfilled, (state, action) => {
        state.permissions.push(action.payload);
      })
      // Update Permission
      .addCase(updatePermission.fulfilled, (state, action) => {
        const index = state.permissions.findIndex(permission => permission.id === action.payload.id);
        if (index !== -1) {
          state.permissions[index] = action.payload;
        }
      })
      // Delete Permission
      .addCase(deletePermission.fulfilled, (state, action) => {
        state.permissions = state.permissions.filter(permission => permission.id !== action.payload);
      })
      // Bulk Create Permissions
      .addCase(bulkCreatePermissions.fulfilled, (state, action) => {
        state.permissions = [...state.permissions, ...action.payload];
      });
  }
});

export const { clearError } = permissionSlice.actions;
export default permissionSlice.reducer;