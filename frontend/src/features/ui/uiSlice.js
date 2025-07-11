// uiSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isFileUploadOpen: false,
  isWritingStylesOpen: false,
  version: 'v1.0',
  versions: ['v1.0', 'v2.0 Beta', 'v3.0 Alpha'],
  showAttachmentOptions: false, 
   fileUploadPosition: { top: 0, left: 0 },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleFileUpload: (state) => {
      state.isFileUploadOpen = !state.isFileUploadOpen;
    },
    toggleWritingStyles: (state) => {
      state.isWritingStylesOpen = !state.isWritingStylesOpen;
    },
    setVersion: (state, action) => {
      state.version = action.payload;
    },
    toggleAttachmentOptions: (state) => {
      state.showAttachmentOptions = !state.showAttachmentOptions;
    },
    closeAttachmentOptions: (state) => {
      state.showAttachmentOptions = false;
    },
    setFileUploadPosition: (state, action) => {
      state.fileUploadPosition = action.payload;
    },
  },
});

export const {toggleFileUpload, toggleWritingStyles, setVersion,toggleAttachmentOptions, closeAttachmentOptions,setFileUploadPosition } = uiSlice.actions;
export default uiSlice.reducer;
