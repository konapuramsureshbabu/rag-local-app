  // App.js
  import React from 'react';
  import { Provider } from 'react-redux';
  import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
  import { store } from './store';
  import Chat from './components/Chat';
  import LoginPage from './components/login';
  import ProtectedRoute from './components/ProtectedRoute';

  import './index.css'
  import { ToastProvider } from './components/toast/ToastProvider';


  // App.js
function App() {
  return (
    <Provider store={store}>
      <ToastProvider> {/* <-- ToastProvider wraps your routes */}
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/chat" element={ <ProtectedRoute>
            <Chat /> {/* <-- Chat component (which is ChatInterface) is inside ProtectedRoute, which is inside ToastProvider */}
          </ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/chat" />} />
        </Routes>
      </ToastProvider>
    </Provider>
  );
}

  export default App;