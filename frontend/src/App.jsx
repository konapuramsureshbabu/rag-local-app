// App.js
import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { store } from './store';
import Chat from './components/Chat';
import LoginPage from './components/login';
import ProtectedRoute from './components/ProtectedRoute';
import Signup from './components/Signup';
import './index.css';
import { ToastProvider } from './components/toast/ToastProvider';
import ProfilePage from './components/chat/sidebar/ProfilePage';
import Sidebar from './components/chat/Sidebar';

// Layout component for protected routes with Sidebar
const ProtectedLayout = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1">
        <Outlet /> {/* Renders the child route (Chat or ProfilePage) */}
      </div>
    </div>
  );
};

function App() {
  return (
    <Provider store={store}>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <ProtectedLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/chat" />} />
              <Route path="chat" element={<Chat />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/chat" />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </Provider>
  );
}

export default App;