// App.js
import React from 'react';
import { Provider } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom'; // Removed BrowserRouter import
import { store } from './store';
import Chat from './components/Chat';
import LoginPage from './components/login';
import ProtectedRoute from './components/ProtectedRoute';
import Signup from './components/Signup';
import './index.css'
import { ToastProvider } from './components/toast/ToastProvider';
import ProfilePage from './components/chat/sidebar/ProfilePage';
import Sidebar from './components/chat/Sidebar';

function App() {
  return (
    <Provider store={store}>
      <ToastProvider>
        {/* Removed Router here */}
        <div className="flex h-screen">
         
           
        <Routes>

          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/chat" element={
            <ProtectedRoute>
                <Sidebar /> 
              <Chat />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/chat" />} />
        </Routes>
         </div>
      </ToastProvider>
    </Provider>
  );
}

export default App;