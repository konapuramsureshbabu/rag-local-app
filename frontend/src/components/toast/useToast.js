import { createContext, useContext } from 'react';

// Create a ToastContext for sharing toast functionality
const ToastContext = createContext();

// Custom hook to access the addToast function
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Export ToastContext for use in ToastProvider
export { ToastContext };