import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { menuAPI } from '../api/axios';

// Initial state
const initialState = {
  menuItems: [],
  loading: false,
  error: null,
  filters: {
    search: '',
    category: '',
    availability: '',
    minPrice: '',
    maxPrice: ''
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  }
};

// Action types
const MENU_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_MENU_ITEMS: 'SET_MENU_ITEMS',
  ADD_MENU_ITEM: 'ADD_MENU_ITEM',
  UPDATE_MENU_ITEM: 'UPDATE_MENU_ITEM',
  DELETE_MENU_ITEM: 'DELETE_MENU_ITEM',
  TOGGLE_AVAILABILITY: 'TOGGLE_AVAILABILITY',
  SET_FILTERS: 'SET_FILTERS',
  SET_PAGINATION: 'SET_PAGINATION',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer function
const menuReducer = (state, action) => {
  switch (action.type) {
    case MENU_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case MENU_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    case MENU_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case MENU_ACTIONS.SET_MENU_ITEMS:
      return {
        ...state,
        menuItems: action.payload.items,
        pagination: action.payload.pagination,
        loading: false,
        error: null
      };

    case MENU_ACTIONS.ADD_MENU_ITEM:
      return {
        ...state,
        menuItems: [action.payload, ...state.menuItems],
        loading: false,
        error: null
      };

    case MENU_ACTIONS.UPDATE_MENU_ITEM:
      return {
        ...state,
        menuItems: state.menuItems.map(item =>
          item._id === action.payload._id ? action.payload : item
        ),
        loading: false,
        error: null
      };

    case MENU_ACTIONS.DELETE_MENU_ITEM:
      return {
        ...state,
        menuItems: state.menuItems.filter(item => item._id !== action.payload),
        loading: false,
        error: null
      };

    case MENU_ACTIONS.TOGGLE_AVAILABILITY:
      return {
        ...state,
        menuItems: state.menuItems.map(item =>
          item._id === action.payload.id
            ? { ...item, isAvailable: action.payload.isAvailable }
            : item
        ),
        loading: false,
        error: null
      };

    case MENU_ACTIONS.SET_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload
        },
        pagination: {
          ...state.pagination,
          page: 1 // Reset to first page when filters change
        }
      };

    case MENU_ACTIONS.SET_PAGINATION:
      return {
        ...state,
        pagination: {
          ...state.pagination,
          ...action.payload
        }
      };

    default:
      return state;
  }
};

// Create context
const MenuContext = createContext();

// Provider component
export const MenuProvider = ({ children }) => {
  const [state, dispatch] = useReducer(menuReducer, initialState);

  // Fetch menu items
  const fetchMenuItems = async (page = 1) => {
    try {
      dispatch({ type: MENU_ACTIONS.SET_LOADING, payload: true });
      
      const params = {
        page,
        limit: state.pagination.limit,
        ...Object.fromEntries(
          Object.entries(state.filters).filter(([_, value]) => value !== '')
        )
      };

      const response = await menuAPI.getMenuItems(params);
      
      dispatch({
        type: MENU_ACTIONS.SET_MENU_ITEMS,
        payload: {
          items: response.data.data,
          pagination: response.data.pagination
        }
      });
    } catch (error) {
      dispatch({
        type: MENU_ACTIONS.SET_ERROR,
        payload: error.message || 'Failed to fetch menu items'
      });
    }
  };

  // Search menu items
  const searchMenuItems = async (query, page = 1) => {
    try {
      dispatch({ type: MENU_ACTIONS.SET_LOADING, payload: true });
      
      const response = await menuAPI.searchMenuItems(query, { page });
      
      dispatch({
        type: MENU_ACTIONS.SET_MENU_ITEMS,
        payload: {
          items: response.data.data,
          pagination: response.data.pagination
        }
      });
    } catch (error) {
      dispatch({
        type: MENU_ACTIONS.SET_ERROR,
        payload: error.message || 'Failed to search menu items'
      });
    }
  };

  // Create menu item
  const createMenuItem = async (itemData) => {
    try {
      dispatch({ type: MENU_ACTIONS.SET_LOADING, payload: true });
      
      const response = await menuAPI.createMenuItem(itemData);
      
      dispatch({
        type: MENU_ACTIONS.ADD_MENU_ITEM,
        payload: response.data.data
      });
      
      return response.data.data;
    } catch (error) {
      dispatch({
        type: MENU_ACTIONS.SET_ERROR,
        payload: error.message || 'Failed to create menu item'
      });
      throw error;
    }
  };

  // Update menu item
  const updateMenuItem = async (id, itemData) => {
    try {
      dispatch({ type: MENU_ACTIONS.SET_LOADING, payload: true });
      
      const response = await menuAPI.updateMenuItem(id, itemData);
      
      dispatch({
        type: MENU_ACTIONS.UPDATE_MENU_ITEM,
        payload: response.data.data
      });
      
      return response.data.data;
    } catch (error) {
      dispatch({
        type: MENU_ACTIONS.SET_ERROR,
        payload: error.message || 'Failed to update menu item'
      });
      throw error;
    }
  };

  // Delete menu item
  const deleteMenuItem = async (id) => {
    try {
      dispatch({ type: MENU_ACTIONS.SET_LOADING, payload: true });
      
      await menuAPI.deleteMenuItem(id);
      
      dispatch({
        type: MENU_ACTIONS.DELETE_MENU_ITEM,
        payload: id
      });
    } catch (error) {
      dispatch({
        type: MENU_ACTIONS.SET_ERROR,
        payload: error.message || 'Failed to delete menu item'
      });
      throw error;
    }
  };

  // Toggle availability (optimistic update)
  const toggleAvailability = async (id) => {
    try {
      // Find the current item
      const currentItem = state.menuItems.find(item => item._id === id);
      if (!currentItem) return;

      const newAvailability = !currentItem.isAvailable;
      
      // Optimistic update
      dispatch({
        type: MENU_ACTIONS.TOGGLE_AVAILABILITY,
        payload: { id, isAvailable: newAvailability }
      });

      // API call
      await menuAPI.toggleAvailability(id);
      
      return newAvailability;
    } catch (error) {
      // Revert optimistic update on error
      dispatch({
        type: MENU_ACTIONS.TOGGLE_AVAILABILITY,
        payload: { id, isAvailable: !state.menuItems.find(item => item._id === id).isAvailable }
      });
      
      dispatch({
        type: MENU_ACTIONS.SET_ERROR,
        payload: error.message || 'Failed to update availability'
      });
      throw error;
    }
  };

  // Update filters
  const updateFilters = (filters) => {
    dispatch({
      type: MENU_ACTIONS.SET_FILTERS,
      payload: filters
    });
  };

  // Update pagination
  const updatePagination = (pagination) => {
    dispatch({
      type: MENU_ACTIONS.SET_PAGINATION,
      payload: pagination
    });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: MENU_ACTIONS.CLEAR_ERROR });
  };

  // Get menu item by ID
  const getMenuItemById = (id) => {
    return state.menuItems.find(item => item._id === id);
  };

  // Get filtered menu items
  const getFilteredMenuItems = () => {
    return state.menuItems;
  };

  const value = {
    // State
    ...state,
    
    // Actions
    fetchMenuItems,
    searchMenuItems,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleAvailability,
    updateFilters,
    updatePagination,
    clearError,
    getMenuItemById,
    getFilteredMenuItems,
    
    // Constants
    MENU_ACTIONS
  };

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  );
};

// Custom hook to use the context
export const useMenu = () => {
  const context = useContext(MenuContext);
  
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  
  return context;
};

export default MenuContext;
