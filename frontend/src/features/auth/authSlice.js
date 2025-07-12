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
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action) {
    state.isAuthenticated = true;
    state.user = action.payload;
    state.loading = false;
    localStorage.setItem('user', JSON.stringify(action.payload)); // ✅ persist user
    },
    loginFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
   // features/auth/authSlice.js
    logout(state) {
    state.isAuthenticated = false;
    state.user = null;
    localStorage.removeItem('user'); // ✅ clear user
    },
     togglePasswordVisibility: (state) => {
      state.showPassword = !state.showPassword;
    },

  },
});
export const { loginStart, loginSuccess, loginFailure, logout, togglePasswordVisibility } = authSlice.actions;
export default authSlice.reducer;