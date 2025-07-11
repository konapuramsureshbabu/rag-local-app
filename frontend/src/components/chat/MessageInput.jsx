import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FiPaperclip, 
  FiSend, 
  FiSearch 
} from 'react-icons/fi';
import { closeAttachmentOptions, toggleAttachmentOptions, toggleFileUpload } from '../../features/ui/uiSlice';


const MessageInput = ({ input, setInput, sendMessage }) => {
  const dispatch = useDispatch();
  const attachBtnRef = useRef(null);
  const { showAttachmentOptions } = useSelector((state) => state.ui);

  const openFileUpload = () => {
    dispatch(toggleFileUpload());
    dispatch(closeAttachmentOptions());
  };

  return (
    <footer className="bg-white border-t p-4">
      <div className="max-w-3xl mx-auto relative">
        <form onSubmit={sendMessage} className="bg-white rounded-xl shadow-md p-4 flex items-center gap-2 w-full relative">
          {/* Attachment button with dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => dispatch(toggleAttachmentOptions())}
              ref={attachBtnRef}
              className="text-gray-500 hover:text-blue-600 transition p-2 rounded-full hover:bg-gray-100"
              aria-label="Attachment options"
              aria-expanded={showAttachmentOptions}
              aria-haspopup="true"
            >
              <FiPaperclip size={20} aria-hidden="true" />
            </button>
            
            {showAttachmentOptions && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-48 bottom-full mb-2 left-0"
                role="menu"
              >
                <button
                  type="button"
                  className="w-full px-4 py-3 hover:bg-gray-50 text-left flex items-center gap-2 text-gray-700"
                  onClick={openFileUpload}
                  role="menuitem"
                >
                  <span className="text-lg" aria-hidden="true">📄</span>
                  <div>
                    <p className="font-medium">Documents</p>
                    <p className="text-xs text-gray-500">PDF, Word, Excel</p>
                  </div>
                </button>
                <div className="border-t border-gray-100" role="separator"></div>
                <button
                  type="button"
                  className="w-full px-4 py-3 hover:bg-gray-50 text-left flex items-center gap-2 text-gray-700"
                  onClick={() => {
                    alert('Photo picker not implemented');
                    dispatch(closeAttachmentOptions());
                  }}
                  role="menuitem"
                >
                  <span className="text-lg" aria-hidden="true">🖼️</span>
                  <div>
                    <p className="font-medium">Photos</p>
                    <p className="text-xs text-gray-500">JPG, PNG, GIF</p>
                  </div>
                </button>
                <div className="border-t border-gray-100" role="separator"></div>
                <button
                  type="button"
                  className="w-full px-4 py-3 hover:bg-gray-50 text-left flex items-center gap-2 text-gray-700"
                  onClick={() => {
                    alert('Folder picker not implemented');
                    dispatch(closeAttachmentOptions());
                  }}
                  role="menuitem"
                >
                  <span className="text-lg" aria-hidden="true">📁</span>
                  <div>
                    <p className="font-medium">Folder</p>
                    <p className="text-xs text-gray-500">Multiple files</p>
                  </div>
                </button>
              </motion.div>
            )}
          </div>
          
          {/* Input field */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AI a question or make a request..."
              className="w-full pl-10 pr-12 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Type your message"
            />
          </div>
          
          {/* Send button */}
          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition"
            aria-label="Send message"
          >
            <FiSend size={18} aria-hidden="true" />
          </button>
        </form>
      </div>
    </footer>
  );
};

export default MessageInput;