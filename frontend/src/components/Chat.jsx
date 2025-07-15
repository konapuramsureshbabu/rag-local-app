import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage } from '../features/chat/chatSlice';
import {
  addToUploadHistory,
  setSelectedFiles,
  clearUploadHistory,
  clearSelectedFiles,
} from '../features/ui/uiSlice';
import ChatHeader from './chat/ChatHeader';
import ChatMessages from './chat/ChatMessages';
import MessageInput from './chat/MessageInput';

const ChatInterface = () => {
  const dispatch = useDispatch();
  const { messages, suggestions } = useSelector((state) => state.chat);
  const { isFileUploadOpen, isWritingStylesOpen, showAttachmentOptions } = useSelector((state) => state.ui);
  const { user } = useSelector((state) => state.auth);
  console.log("is", showAttachmentOptions);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [ws, setWs] = useState(null);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  const fetchFiles = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BE_BASE}:${import.meta.env.VITE_BE_PORT}/files`);
      if (!response.ok) throw new Error('Failed to fetch files');
      const data = await response.json();
      console.log('Backend /files response:', data);
      if (!Array.isArray(data)) {
        console.warn('Backend returned non-array data:', data);
        dispatch(clearUploadHistory());
        setFiles([]);
        return;
      }
      setFiles(data);
      const mappedHistory = data
        .filter(file => file && file.id && file.filename && file.filepath)
        .map(file => ({
          0: {
            id: file.id,
            filename: file.filename,
            filepath: file.filepath,
            is_active: file.is_active || false,
          },
          date: file.uploadedAt || new Date().toISOString(),
        }));
      console.log('Dispatching addToUploadHistory with:', mappedHistory);
      dispatch(clearUploadHistory());
      dispatch(addToUploadHistory(mappedHistory));
      const activeFile = data.find(file => file.is_active);
      console.log("ac",activeFile,data);

      if (activeFile) {
        setSelectedFile(activeFile);
        
        console.log('Dispatching setSelectedFiles with:', [activeFile]);
        dispatch(setSelectedFiles([activeFile]));
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      dispatch(clearUploadHistory());
      setFiles([]);
    }
  };

  const fetchFileById = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BE_BASE}:${import.meta.env.VITE_BE_PORT}/file/${id}`);
      if (!response.ok) throw new Error('File not found');
      const data = await response.json();
      setSelectedFile(data);
      await setActiveFile(id);
    } catch (error) {
      console.error('Error fetching file:', error);
    }
  };

  const setActiveFile = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BE_BASE}:${import.meta.env.VITE_BE_PORT}/file/${id}/set-active`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to set active file');
      await fetchFiles();
      const file = files.find(f => f.id === id);
      if (file && ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ text: `Selected file: ${file.filename}`, sender: 'user' }));
        dispatch(setSelectedFiles([file]));
      }
    } catch (error) {
      console.error('Error setting active file:', error);
    }
  };

  const deleteAllFiles = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BE_BASE}:${import.meta.env.VITE_BE_PORT}/files`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete files');
      setFiles([]);
      setSelectedFile(null);
      dispatch(clearSelectedFiles());
      dispatch(clearUploadHistory());
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ text: 'All files deleted', sender: 'user' }));
      }
    } catch (error) {
      console.error('Error deleting all files:', error);
    }
  };

  const deleteFile = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BE_BASE}:${import.meta.env.VITE_BE_PORT}/file/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete file');
      setFiles(files.filter(file => file.id !== id));
      if (selectedFile && selectedFile.id === id) {
        setSelectedFile(null);
      }
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ text: `File with ID ${id} deleted`, sender: 'user' }));
      }
      await fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  useEffect(() => {
    const connectWebSocket = () => {
      const websocket = new WebSocket(`${import.meta.env.VITE_WS_BASE}:${import.meta.env.VITE_BE_PORT}/ws/chat`);

      websocket.onopen = () => {
        console.log('WebSocket connected');
        setWs(websocket);
      };

      websocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.text && message.sender) {
            console.log("messagee",message);
            
            dispatch(addMessage({ text: message.text, sender: message.sender }));
            if (message.sender === 'bot' && message.text.includes('Error')) {
            }
          } else {
            console.error('Invalid message format:', message);
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      websocket.onclose = (event) => {
        console.log(`WebSocket closed with code: ${event.code}, reason: ${event.reason}`);
        setWs(null);
        setTimeout(connectWebSocket, 3000);
      };

      websocket.onerror = (error) => {
      };

      return websocket;
    };

    const websocket = connectWebSocket();
    fetchFiles();

    return () => {
      if (websocket.readyState === WebSocket.OPEN) {
        console.log('Closing WebSocket in cleanup');
        websocket.close(1000, 'Component unmounted');
      }
    };
  }, [dispatch]);

  const handleSuggestionClick = (suggestion) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const message = { text: suggestion, sender: 'user' };
      console.log("me",message);
      
    dispatch(addMessage(message));
      ws.send(JSON.stringify(message));
      setInput('');
    } else {
      console.error('Cannot send suggestion: WebSocket not open');
    }
  };

  useEffect(() => {
    const el = document.getElementById('chat-end');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-lg shadow-lg text-white transition-opacity duration-300 ${
              toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      <main className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-dark-900 to-purple-400">
        <div id="chat-end" />
        <ChatHeader selectedFile={selectedFile} />
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
          ws={ws}
          fetchFiles={fetchFiles}
          fetchFileById={fetchFileById}
          setActiveFile={setActiveFile}
          deleteFile={deleteFile}
          deleteAllFiles={deleteAllFiles}
        />
      </main>
    </div>
  );
};

export default ChatInterface;