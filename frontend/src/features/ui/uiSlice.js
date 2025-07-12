// uiSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isFileUploadOpen: false,
  isWritingStylesOpen: false,
  version: 'v1.0',
  versions: ['v1.0', 'v2.0 Beta', 'v3.0 Alpha'],
  showAttachmentOptions: false, 
   fileUploadPosition: { top: 0, left: 0 },
   selectedFiles: [], 

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
    setSelectedFiles: (state, action) => {
      const newFiles = action.payload;

      newFiles.forEach(newFile => {
        const alreadyExists = state.selectedFiles.some(
          existing => existing.file.name === newFile.name && existing.file.size === newFile.size
        );

        if (!alreadyExists) {
          state.selectedFiles.push({
            file: newFile,
            isSelected: true,
          });
        }
      });
    },


    removeSelectedFile: (state, action) => {
      state.selectedFiles = state.selectedFiles.filter((_, idx) => idx !== action.payload);
    },
    clearSelectedFiles: (state) => {
      state.selectedFiles = [];
    },
    toggleFileSelection: (state, action) => {
  const idx = action.payload;
  state.selectedFiles[idx].isSelected = !state.selectedFiles[idx].isSelected;
}

  },
});

export const {toggleFileUpload, toggleWritingStyles, setVersion,toggleAttachmentOptions, closeAttachmentOptions, setFileUploadPosition ,setSelectedFiles,     
  clearSelectedFiles,   
  removeSelectedFile,toggleFileSelection} = uiSlice.actions;
export default uiSlice.reducer;
