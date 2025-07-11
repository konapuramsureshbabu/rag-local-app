import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  addMessage,
  setSuggestions
} from '../features/chat/chatSlice';
import {
  toggleFileUpload,
  toggleWritingStyles,
  closeAttachmentOptions
} from '../features/ui/uiSlice';

import Sidebar from './chat/Sidebar';
import ChatHeader from './chat/ChatHeader';
import ChatMessages from './chat/ChatMessages';
import MessageInput from './chat/MessageInput';

import WritingStylesModal from './Modals/WritingStylesModal';
import FileUploadModal from './Modals/FileUploadsModals';

const ChatInterface = () => {
  const dispatch = useDispatch();

  const { messages, suggestions } = useSelector((state) => state.chat);
  const {
    isFileUploadOpen,
    isWritingStylesOpen,
    showAttachmentOptions
  } = useSelector((state) => state.ui);
  const { user } = useSelector((state) => state.auth);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [ws, setWs] = useState(null);

useEffect(() => {
  const websocket = new WebSocket('ws://localhost:8000/ws/chat');

  websocket.onopen = () => {
    console.log('WebSocket connected');
    setWs(websocket);
  };

  websocket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    dispatch(addMessage({ text: message.text, sender: message.sender }));
  };

  websocket.onclose = () => {
    console.log('WebSocket disconnected');
  };

  return () => {
    websocket.close();
  };
}, [dispatch]);
const sendMessage = (e) => {
  e.preventDefault();

  if (ws && input.trim()) {
    const message = { text: input.trim(), sender: 'user' };
    
    // Add user's message immediately to Redux state
    dispatch(addMessage(message));

    // Send the message to WebSocket server
    ws.send(JSON.stringify(message));

    setInput('');
  }
};


const handleSuggestionClick = (suggestion) => {
  setInput('');
  
  const message = { text: suggestion, sender: 'user' };

  dispatch(addMessage(message));

  if (ws) {
    ws.send(JSON.stringify(message));
  }
};
useEffect(() => {
  const el = document.getElementById('chat-end');
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}, [messages]);


  return (
    <div className="flex h-screen bg-amber-100">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden bg-amber-100">
        <div id="chat-end" />

        <ChatHeader />
        
        <ChatMessages 
          messages={messages} 
          isTyping={isTyping} 
          suggestions={suggestions} 
          handleSuggestionClick={handleSuggestionClick} 
          user={user} 
        />
        
        <MessageInput 
          input={input} 
          setInput={setInput} 
          sendMessage={sendMessage} 
        />
      </main>

      <WritingStylesModal 
        isWritingStylesOpen={isWritingStylesOpen} 
        onHide={() => dispatch(toggleWritingStyles())} 
      />
      
      <FileUploadModal isFileUploadOpen={isFileUploadOpen} />
    </div>
  );
};

export default ChatInterface;