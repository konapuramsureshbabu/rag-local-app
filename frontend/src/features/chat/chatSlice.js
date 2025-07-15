// chatSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [],
  currentThread: null,
  threads: [],
  loading: false,
  suggestions: [
    "Write a to-do list for a personal project",
    "Generate an email to reply to a job offer",
    "Summarize this article in one paragraph",
    "How does AI work in a technical capacity"
  ],
};


const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage(state, action) {

      state.messages.push(action.payload);
    },
    setThread(state, action) {
      state.currentThread = action.payload;
    },
    setThreads(state, action) {
      state.threads = action.payload;
    },
    setSuggestions(state, action) {
      state.suggestions = action.payload;
    },
  },
});

export const { addMessage, setThread, setThreads, setSuggestions } = chatSlice.actions;
export default chatSlice.reducer;