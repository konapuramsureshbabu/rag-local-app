import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  fileUpload: {
    isOpen: false,
    position: { top: 0, left: 0 },
    selectedFiles: [],
    uploadHistory: [],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: ['image/*', 'application/pdf', 'text/plain'],
  },
  panels: {
    writingStyles: {
      isOpen: false,
      activeStyle: 'default',
    },
    attachmentOptions: {
      isOpen: false,
    },
  },
  version: {
    current: 'v1.0',
    available: ['v1.0', 'v2.0 Beta', 'v3.0 Alpha'],
    lastUpdated: new Date().toISOString(),
  },
  status: 'idle',
  error: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleFileUpload: (state) => {
      state.fileUpload.isOpen = !state.fileUpload.isOpen;
    },
    setFileUploadPosition: (state, action) => {
      state.fileUpload.position = action.payload;
    },
    setSelectedFiles: (state, action) => {
      const newFiles = action.payload.filter((newFile) => {
        // Validate file size
        if (newFile.size > state.fileUpload.maxFileSize) {
          console.warn(`File ${newFile.name} exceeds maximum size limit`);
          return false;
        }
        // Validate file type
        const isAllowedType = state.fileUpload.allowedFileTypes.some((type) => {
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
          (existing) => existing.name === newFile.name && existing.size === newFile.size
        );
      });
      // Append new files directly, preserving existing structure
      state.fileUpload.selectedFiles = [...state.fileUpload.selectedFiles, ...newFiles];
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
      if (state.fileUpload.uploadHistory.length > 50) {
        state.fileUpload.uploadHistory.pop();
      }
    },
    clearUploadHistory: (state) => {
      state.fileUpload.uploadHistory = [];
    },
    toggleWritingStyles: (state) => {
      state.panels.writingStyles.isOpen = !state.panels.writingStyles.isOpen;
    },
    setWritingStyle: (state, action) => {
      state.panels.writingStyles.activeStyle = action.payload;
    },
    toggleAttachmentOptions: (state) => {
      console.log('Toggling attachment options:', state.panels.attachmentOptions.isOpen);
      state.panels.attachmentOptions.isOpen = !state.panels.attachmentOptions.isOpen;
    },
    closeAttachmentOptions: (state) => {
      state.panels.attachmentOptions.isOpen = false;
    },
    setVersion: (state, action) => {
      if (state.version.available.includes(action.payload)) {
        state.version.current = action.payload;
        state.version.lastUpdated = new Date().toISOString();
      }
    },
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

export const selectFileUpload = (state) => state.ui.fileUpload;
export const selectPanels = (state) => state.ui.panels;
export const selectVersion = (state) => state.ui.version;
export const selectUIStatus = (state) => state.ui.status;
export const selectUIError = (state) => state.ui.error;
export const selectUploadHistory = (state) => state.ui.fileUpload.uploadHistory;

export default uiSlice.reducer;