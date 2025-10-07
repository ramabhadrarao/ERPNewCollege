import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import menuService from '../services/menu.service';

export interface MenuItem {
  id: number;
  name: string;
  resource: string;
  icon?: string;
  path: string;
  parentId?: number | null;
  order?: number;
  isActive: boolean;
  children?: MenuItem[];
}

interface MenuState {
  menus: MenuItem[];
  loading: boolean;
  error: string | null;
}

const initialState: MenuState = {
  menus: [],
  loading: false,
  error: null
};

export const fetchMenus = createAsyncThunk(
  'menus/fetchAll',
  async () => {
    return await menuService.getAll();
  }
);

export const createMenuItem = createAsyncThunk(
  'menus/create',
  async (menuData: { name: string; resource: string; icon?: string; path: string; parentId?: number | null; order?: number }) => {
    return await menuService.create(menuData);
  }
);

export const updateMenuItem = createAsyncThunk(
  'menus/update',
  async ({ id, data }: { id: number; data: { name: string; resource: string; icon?: string; path: string; parentId?: number | null; order?: number; isActive?: boolean } }) => {
    return await menuService.update(id, data);
  }
);

export const deleteMenuItem = createAsyncThunk(
  'menus/delete',
  async (id: number) => {
    await menuService.delete(id);
    return id;
  }
);

export const reorderMenuItems = createAsyncThunk(
  'menus/reorder',
  async (items: Array<{ id: number; order: number; parentId?: number | null }>) => {
    return await menuService.reorder(items);
  }
);

const menuSlice = createSlice({
  name: 'menus',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Menus
      .addCase(fetchMenus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenus.fulfilled, (state, action) => {
        state.loading = false;
        state.menus = action.payload;
      })
      .addCase(fetchMenus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch menus';
      })
      // Create Menu Item
      .addCase(createMenuItem.fulfilled, (state, action) => {
        state.menus.push(action.payload);
      })
      // Update Menu Item
      .addCase(updateMenuItem.fulfilled, (state, action) => {
        // For hierarchical data, we need a recursive update function
        const updateMenuItemRecursive = (items: MenuItem[], updatedItem: MenuItem): MenuItem[] => {
          return items.map(item => {
            if (item.id === updatedItem.id) {
              return updatedItem;
            }
            if (item.children) {
              return {
                ...item,
                children: updateMenuItemRecursive(item.children, updatedItem)
              };
            }
            return item;
          });
        };
        
        state.menus = updateMenuItemRecursive(state.menus, action.payload);
      })
      // Delete Menu Item
      .addCase(deleteMenuItem.fulfilled, (state, action) => {
        // For hierarchical data, we need a recursive delete function
        const deleteMenuItemRecursive = (items: MenuItem[], idToDelete: number): MenuItem[] => {
          return items
            .filter(item => item.id !== idToDelete)
            .map(item => {
              if (item.children) {
                return {
                  ...item,
                  children: deleteMenuItemRecursive(item.children, idToDelete)
                };
              }
              return item;
            });
        };
        
        state.menus = deleteMenuItemRecursive(state.menus, action.payload);
      })
      // Reorder Menu Items
      .addCase(reorderMenuItems.fulfilled, (state, action) => {
        state.menus = action.payload;
      });
  }
});

export const { clearError } = menuSlice.actions;
export default menuSlice.reducer;