import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  showAttachmentOptions: false,
  selectedFiles: [],
  uploadHistory: [],
  showUploadHistoryModal: false,
  selectedUploads: [],
  version: 'v1.0', // Default version
  showFileUpload: false, // File upload visibility
  showWritingStyles: false, // New state for writing styles visibility
  currentWritingStyle: 'default' // Optional: Track the current writing style
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleAttachmentOptions(state) {
      state.showAttachmentOptions = !state.showAttachmentOptions;
    },
    closeAttachmentOptions(state) {
      state.showAttachmentOptions = false;
    },
    setSelectedFiles(state, action) {
      state.selectedFiles = action.payload;
    },
    removeSelectedFile(state, action) {
      state.selectedFiles = state.selectedFiles.filter((_, index) => index !== action.payload);
    },
    clearSelectedFiles(state) {
      state.selectedFiles = [];
    },
    toggleFileSelection(state, action) {
      state.selectedFiles = state.selectedFiles.map((file, index) =>
        index === action.payload ? { ...file, isSelected: !file.isSelected } : file
      );
    },
    addToUploadHistory(state, action) {
      state.uploadHistory.push(action.payload);
    },
    setUploadHistory(state, action) {
      state.uploadHistory = action.payload;
    },
    toggleUploadHistoryModal(state) {
      state.showUploadHistoryModal = !state.showUploadHistoryModal;
    },
    setSelectedUploads(state, action) {
      state.selectedUploads = action.payload;
    },
    addFromUploadHistory(state, action) {
      state.selectedFiles.push(action.payload);
    },
    setVersion(state, action) {
      state.version = action.payload;
    },
    toggleFileUpload(state) {
      state.showFileUpload = !state.showFileUpload;
    },
    toggleWritingStyles(state) { // New action to toggle writing styles visibility
      state.showWritingStyles = !state.showWritingStyles;
    },
    setWritingStyle(state, action) { // Optional: Set a specific writing style
      state.currentWritingStyle = action.payload;
    }
  }
});

export const {
  toggleAttachmentOptions,
  closeAttachmentOptions,
  setSelectedFiles,
  removeSelectedFile,
  clearSelectedFiles,
  toggleFileSelection,
  addToUploadHistory,
  setUploadHistory,
  toggleUploadHistoryModal,
  setSelectedUploads,
  addFromUploadHistory,
  setVersion,
  toggleFileUpload,
  toggleWritingStyles, // Added export for toggleWritingStyles
  setWritingStyle // Optional export for setting a specific style
} = uiSlice.actions;

export default uiSlice.reducer;