import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import groupService from '../services/group.service';

interface Group {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  permissions: any[];
}

interface GroupState {
  groups: Group[];
  loading: boolean;
  error: string | null;
}

const initialState: GroupState = {
  groups: [],
  loading: false,
  error: null
};

export const fetchGroups = createAsyncThunk(
  'groups/fetchAll',
  async () => {
    return await groupService.getAll();
  }
);

export const createGroup = createAsyncThunk(
  'groups/create',
  async (groupData: { name: string; description?: string; permissionIds?: number[] }) => {
    return await groupService.create(groupData);
  }
);

export const updateGroup = createAsyncThunk(
  'groups/update',
  async ({ id, data }: { id: number; data: { name?: string; description?: string; permissionIds?: number[]; isActive?: boolean } }) => {
    return await groupService.update(id, data);
  }
);

export const deleteGroup = createAsyncThunk(
  'groups/delete',
  async (id: number) => {
    await groupService.delete(id);
    return id;
  }
);

const groupSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Groups
      .addCase(fetchGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = action.payload;
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch groups';
      })
      // Create Group
      .addCase(createGroup.fulfilled, (state, action) => {
        state.groups.push(action.payload);
      })
      // Update Group
      .addCase(updateGroup.fulfilled, (state, action) => {
        const index = state.groups.findIndex(group => group.id === action.payload.id);
        if (index !== -1) {
          state.groups[index] = action.payload;
        }
      })
      // Delete Group
      .addCase(deleteGroup.fulfilled, (state, action) => {
        state.groups = state.groups.filter(group => group.id !== action.payload);
      });
  }
});

export const { clearError } = groupSlice.actions;
export default groupSlice.reducer;