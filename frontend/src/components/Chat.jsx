import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  addMessage,
} from '../features/chat/chatSlice';
import {
  toggleWritingStyles,
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
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [toasts, setToasts] = useState([]); // State for toast notifications

  // Add a toast notification
  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    // Auto-dismiss toast after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  //Fetch all files
  const fetchFiles = async () => {
    try {
      const response = await fetch('http://localhost:8002/files');
      if (!response.ok) throw new Error('Failed to fetch files');
      const data = await response.json();
      setFiles(data);
      const activeFile = data.find(file => file.is_active);
      if (activeFile) setSelectedFile(activeFile);
      // addToast('Files fetched successfully', 'success');
    } catch (error) {
      console.error('Error fetching files:', error);
      // addToast('Failed to fetch files', 'error');
    }
  };

  // Set active file
  const setActiveFile = async (id) => {
    try {
      const response = await fetch(`http://localhost:8002/file/${id}/set-active`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to set active file');
      await fetchFiles(); // Refresh file list to update is_active status
      const file = files.find(f => f.id === id);
      if (file && ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ text: `Selected file: ${file.filename}`, sender: 'user' }));
        // addToast(`Selected file: ${file.filename}`, 'success');
      }
    } catch (error) {
      console.error('Error setting active file:', error);
      // addToast('Failed to set active file', 'error');
    }
  };

  // Fetch single file by ID
  const fetchFileById = async (id) => {
    try {
      const response = await fetch(`http://localhost:8002/file/${id}`);
      if (!response.ok) throw new Error('File not found');
      const data = await response.json();
      setSelectedFile(data);
      await setActiveFile(id); // Set as active when selected
    } catch (error) {
      console.error('Error fetching file:', error);
      // addToast('Failed to fetch file', 'error');
    }
  };

  // Delete all files
  const deleteAllFiles = async () => {
    try {
      const response = await fetch('http://localhost:8002/files', { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete files');
      setFiles([]);
      setSelectedFile(null);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ text: 'All files deleted', sender: 'user' }));
        // addToast('All files deleted successfully', 'success');
      }
    } catch (error) {
      console.error('Error deleting all files:', error);
      // addToast('Failed to delete all files', 'error');
    }
  };

  // Delete single file
  const deleteFile = async (id) => {
    try {
      const response = await fetch(`http://localhost:8002/file/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete file');
      setFiles(files.filter(file => file.id !== id));
      if (selectedFile && selectedFile.id === id) {
        setSelectedFile(null);
      }
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ text: `File with ID ${id} deleted`, sender: 'user' }));
        // addToast(`File with ID ${id} deleted`, 'success');
      }
      await fetchFiles(); // Refresh file list to update is_active status
    } catch (error) {
      console.error('Error deleting file:', error);
      // addToast('Failed to delete file', 'error');
    }
  };

  useEffect(() => {
    const connectWebSocket = () => {
      const websocket = new WebSocket('ws://localhost:8002/ws/chat');

      websocket.onopen = () => {
        console.log('WebSocket connected');
        setWs(websocket);
        // addToast('WebSocket connected', 'success');
      };

      websocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.text && message.sender) {
            dispatch(addMessage({ text: message.text, sender: message.sender }));
            if (message.sender === 'bot' && message.text.includes('Error')) {
              // addToast(message.text, 'error');
            }
          } else {
            console.error('Invalid message format:', message);
            // addToast('Invalid message received from server', 'error');
          }
        } catch (error) {
          console.error('Error parsing message:', error);
          // addToast('Error parsing server message', 'error');
        }
      };

      websocket.onclose = (event) => {
        console.log(`WebSocket closed with code: ${event.code}, reason: ${event.reason}`);
        setWs(null);
        // addToast(`WebSocket closed: ${event.reason}`, 'error');
        setTimeout(connectWebSocket, 3000);
      };

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        // addToast('WebSocket error occurred', 'error');
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

  const sendMessage = (e) => {
    e.preventDefault();
    if (ws && ws.readyState === WebSocket.OPEN && input.trim()) {
      const message = { text: input.trim(), sender: 'user' };
      dispatch(addMessage(message));
      ws.send(JSON.stringify(message));
      // addToast('Message sent', 'success');
      setInput('');
    } else {
      console.error('Cannot send message: WebSocket not open or input empty');
      // addToast('Cannot send message: WebSocket not connected or input empty', 'error');
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput('');
    const message = { text: suggestion, sender: 'user' };
    dispatch(addMessage(message));
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
      // addToast('Suggestion sent', 'success');
    } else {
      console.error('Cannot send suggestion: WebSocket not open');
      // addToast('Cannot send suggestion: WebSocket not connected', 'error');
    }
  };

  useEffect(() => {
    const el = document.getElementById('chat-end');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex h-screen bg-amber-100">
      {/* Toast Notifications */}
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

      <Sidebar 
        files={files} 
        onFileSelect={fetchFileById} 
        onDeleteFile={deleteFile} 
        onDeleteAllFiles={deleteAllFiles}
      />
      <main className="flex-1 flex flex-col overflow-hidden bg-amber-100">
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
          sendMessage={sendMessage} 
        />
      </main>
      <WritingStylesModal 
        isWritingStylesOpen={isWritingStylesOpen} 
        onHide={() => dispatch(toggleWritingStyles())} 
      />
      <FileUploadModal isFileUploadOpen={isFileUploadOpen} onUploadSuccess={fetchFiles} />
    </div>
  );
};

export default ChatInterface;