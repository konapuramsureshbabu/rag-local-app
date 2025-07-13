import { createSlice } from '@reduxjs/toolkit';

const userFromStorage = JSON.parse(localStorage.getItem('user'));

const initialState = {
  isAuthenticated: !!userFromStorage,
  user: userFromStorage,
  loading: false,
  error: null,
  showPassword: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Login reducers
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action) {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.loading = false;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    loginFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Logout reducer
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      localStorage.removeItem('user');
    },
    
    // Password visibility toggle
    togglePasswordVisibility: (state) => {
      state.showPassword = !state.showPassword;
    },
    
    // Registration reducers
    registerStart(state) {
      state.loading = true;
      state.error = null;
    },
    registerSuccess(state, action) {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    registerFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Clear error reducer
    clearError(state) {
      state.error = null;
    }
  },
});

// Export all actions
export const { 
  loginStart, 
  loginSuccess, 
  loginFailure,
  logout,
  togglePasswordVisibility,
  registerStart,
  registerSuccess,
  registerFailure,
  clearError
} = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectCurrentUser = (state) => state.auth.user;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectPasswordVisibility = (state) => state.auth.showPassword;

export default authSlice.reducer;