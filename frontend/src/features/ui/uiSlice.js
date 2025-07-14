import { createSlice } from '@reduxjs/toolkit';

// Define initial state with clear structure and documentation
const initialState = {
  // File upload related states
  fileUpload: {
    isOpen: false,
    position: { top: 0, left: 0 },
    selectedFiles: [],
    uploadHistory: [],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: ['image/*', 'application/pdf', 'text/plain'],
  },
  
  // UI control states
  panels: {
    writingStyles: {
      isOpen: false,
      activeStyle: 'default',
    },
    attachmentOptions: {
      isOpen: false,
    },
  },
  
  // Version control
  version: {
    current: 'v1.0',
    available: ['v1.0', 'v2.0 Beta', 'v3.0 Alpha'],
    lastUpdated: new Date().toISOString(),
  },
  
  // UI status
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {

    // File upload actions
    toggleFileUpload: (state) => {
      state.fileUpload.isOpen = !state.fileUpload.isOpen;
    },
    
    setFileUploadPosition: (state, action) => {
      state.fileUpload.position = action.payload;
    },
    
    setSelectedFiles: (state, action) => {
      const newFiles = action.payload.filter(newFile => {
        // Check file size
        if (newFile.size > state.fileUpload.maxFileSize) {
          console.warn(`File ${newFile.name} exceeds maximum size limit`);
          return false;
        }
        
        // Check file type
        const isAllowedType = state.fileUpload.allowedFileTypes.some(type => {
          if (type.endsWith('/*')) {
            return newFile.type.startsWith(type.split('/*')[0]);
          }
          return newFile.type === type;
        });
        
        if (!isAllowedType) {
          console.warn(`File type ${newFile.type} not allowed`);
          return false;
        }
        
        // Check for duplicates
        return !state.fileUpload.selectedFiles.some(
          existing => existing.file.name === newFile.name && 
                     existing.file.size === newFile.size
        );
      });
      
      newFiles.forEach(file => {
        state.fileUpload.selectedFiles.push({
          file,
          isSelected: true,
          uploadProgress: 0,
          status: 'pending', // 'pending' | 'uploading' | 'completed' | 'failed'
        });
      });
    },
    
    removeSelectedFile: (state, action) => {
      state.fileUpload.selectedFiles.splice(action.payload, 1);
    },
    
    clearSelectedFiles: (state) => {
      state.fileUpload.selectedFiles = [];
    },
    
    toggleFileSelection: (state, action) => {
      const index = action.payload;
      if (index >= 0 && index < state.fileUpload.selectedFiles.length) {
        state.fileUpload.selectedFiles[index].isSelected = 
          !state.fileUpload.selectedFiles[index].isSelected;
      }
    },
    
    updateFileUploadProgress: (state, action) => {
      const { index, progress } = action.payload;
      if (index >= 0 && index < state.fileUpload.selectedFiles.length) {
        state.fileUpload.selectedFiles[index].uploadProgress = progress;
        state.fileUpload.selectedFiles[index].status = 
          progress === 100 ? 'completed' : 'uploading';
      }
    },
    
    addToUploadHistory: (state, action) => {
      state.fileUpload.uploadHistory.unshift({
        ...action.payload,
        date: new Date().toISOString(),
      });
      
      // Keep only the last 50 uploads
      if (state.fileUpload.uploadHistory.length > 50) {
        state.fileUpload.uploadHistory.pop();
      }
    },
    
    clearUploadHistory: (state) => {
      state.fileUpload.uploadHistory = [];
    },
    
    // Panel controls
    toggleWritingStyles: (state) => {
      state.panels.writingStyles.isOpen = !state.panels.writingStyles.isOpen;
    },
    
    setWritingStyle: (state, action) => {
      state.panels.writingStyles.activeStyle = action.payload;
    },
    
    toggleAttachmentOptions: (state) => {
      state.panels.attachmentOptions.isOpen = !state.panels.attachmentOptions.isOpen;
    },
    
    closeAttachmentOptions: (state) => {
      state.panels.attachmentOptions.isOpen = false;
    },
    
    // Version control
    setVersion: (state, action) => {
      if (state.version.available.includes(action.payload)) {
        state.version.current = action.payload;
        state.version.lastUpdated = new Date().toISOString();
      }
    },
    
    // Status management
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    
    setError: (state, action) => {
      state.error = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
  },
});

// Export all actions
export const {
  
  toggleFileUpload,
  setFileUploadPosition,
  setSelectedFiles,
  removeSelectedFile,
  clearSelectedFiles,
  toggleFileSelection,
  updateFileUploadProgress,
  addToUploadHistory,
  clearUploadHistory,
  toggleWritingStyles,
  setWritingStyle,
  toggleAttachmentOptions,
  closeAttachmentOptions,
  setVersion,
  setStatus,
  setError,
  clearError,
 
} = uiSlice.actions;

// Selectors
export const selectFileUpload = (state) => state.ui.fileUpload;
export const selectPanels = (state) => state.ui.panels;
export const selectVersion = (state) => state.ui.version;
export const selectUIStatus = (state) => state.ui.status;
export const selectUIError = (state) => state.ui.error;
// In your selectors section
export const selectUploadHistory = (state) => state.ui.fileUpload.uploadHistory;

// Export the reducer
export default uiSlice.reducer;