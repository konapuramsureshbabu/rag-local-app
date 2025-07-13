  // App.js
  import React from 'react';
  import { Provider } from 'react-redux';
  import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
  import { store } from './store';
  import Chat from './components/Chat';
  import LoginPage from './components/login';
  import ProtectedRoute from './components/ProtectedRoute';
  import Signup from './components/Signup';
  import './index.css'
  import { ToastProvider } from './components/toast/ToastProvider';


  // App.js
function App() {
  return (
    <Provider store={store}>
      <ToastProvider> {/* <-- ToastProvider wraps your routes */}
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path='/signup' element={ <Signup/> } />
          <Route path="/chat" element={ <ProtectedRoute>
            <Chat />
          </ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/chat" />} />
        </Routes>
      </ToastProvider>
    </Provider>
  );
}

  export default App;