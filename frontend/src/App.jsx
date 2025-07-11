// App.js
import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { store } from './store';
import Chat from './components/Chat';
import LoginPage from './components/login';
import ProtectedRoute from './components/ProtectedRoute';

import './index.css'


function App() {
  return (
   <Provider store={store}>
          <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/chat" element={ <ProtectedRoute>
      <Chat />
    </ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/chat" />} />
        </Routes>
    </Provider>
  );
}

export default App;