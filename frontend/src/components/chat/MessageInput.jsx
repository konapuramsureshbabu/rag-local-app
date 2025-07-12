import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiPaperclip,
  FiSend,
  FiSearch,
  FiX,
} from 'react-icons/fi';
import { IoMdMic } from "react-icons/io";
import { HiOutlineSpeakerphone } from "react-icons/hi";
import axios from 'axios';
import {
  toggleAttachmentOptions,
  closeAttachmentOptions,
  setSelectedFiles,
  removeSelectedFile,
  clearSelectedFiles,
  toggleFileSelection,
} from '../../features/ui/uiSlice';

const MessageInput = ({ input, setInput }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef();
  const photoInputRef = useRef();
  const folderInputRef = useRef();
  const [loading, setLoading] = useState(false);

  const { showAttachmentOptions, selectedFiles } = useSelector((state) => state.ui);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    dispatch(setSelectedFiles(files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const uploadedFileUrls = [];
    const selectedToSend = selectedFiles.filter(f => f.isSelected);

    if (selectedToSend.length > 0) {
      for (let { file } of selectedToSend) {
        const formData = new FormData();
        formData.append('file', file);
        try {
          const res = await axios.post('http://localhost:8002/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          uploadedFileUrls.push(res.data.fileUrl);
        } catch (err) {
          console.error('Upload error:', err);
          alert('Error uploading file');
          setLoading(false);
          return;
        }
      }
      dispatch(clearSelectedFiles());
    }

    const message = {
      text: input,
      files: uploadedFileUrls,
    };

    console.log('Message sent:', message);
    setInput('');
    setLoading(false);
  };

  const handleMicClick = () => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + ' ' + transcript);
    };

    recognition.onerror = (e) => {
      alert('Mic error: ' + e.error);
    };

    recognition.start();
  };

  const handleSpeakText = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(input || 'No text to speak');
      utterance.lang = 'en-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSuggestion = () => {
    const suggestions = [
      'Summarize this document in 3 points',
      'Create a cover letter from this resume',
      'Extract tasks from this report',
      'Translate this to Hindi'
    ];
    const random = suggestions[Math.floor(Math.random() * suggestions.length)];
    setInput(random);
  };

  return (
    <footer className="bg-white border-t p-4">
      <div className="max-w-3xl mx-auto relative">
        {selectedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedFiles.map((fileObj, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-1 bg-gray-100 border border-gray-300 rounded-lg text-sm"
              >
                <input
                  type="checkbox"
                  checked={fileObj.isSelected}
                  onChange={() => dispatch(toggleFileSelection(idx))}
                  className="accent-blue-600"
                />
                <span className="truncate max-w-[140px]">{fileObj.file.name}</span>
                <button
                  onClick={() => dispatch(removeSelectedFile(idx))}
                  className="text-red-500 hover:text-red-700"
                  aria-label="Remove file"
                >
                  <FiX />
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-4 flex items-center gap-2 w-full relative">
          {/* Attachment Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => dispatch(toggleAttachmentOptions())}
              className="text-gray-500 hover:text-blue-600 transition p-2 rounded-full hover:bg-gray-100"
              aria-label="Attachment options"
              aria-expanded={showAttachmentOptions}
              aria-haspopup="true"
            >
              <FiPaperclip size={20} />
            </button>

            {showAttachmentOptions && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-48 bottom-full mb-2 left-0"
              >
                <button type="button" onClick={() => { fileInputRef.current.click(); dispatch(closeAttachmentOptions()); }} className="w-full px-4 py-3 hover:bg-gray-50 text-left flex items-center gap-2 text-gray-700">
                  <span>📄</span><div><p className="font-medium">Documents</p><p className="text-xs text-gray-500">PDF, Word, Excel</p></div>
                </button>
                <div className="border-t border-gray-100"></div>
                <button type="button" onClick={() => { photoInputRef.current.click(); dispatch(closeAttachmentOptions()); }} className="w-full px-4 py-3 hover:bg-gray-50 text-left flex items-center gap-2 text-gray-700">
                  <span>🖼️</span><div><p className="font-medium">Photos</p><p className="text-xs text-gray-500">JPG, PNG, GIF</p></div>
                </button>
                <div className="border-t border-gray-100"></div>
                <button type="button" onClick={() => { folderInputRef.current.click(); dispatch(closeAttachmentOptions()); }} className="w-full px-4 py-3 hover:bg-gray-50 text-left flex items-center gap-2 text-gray-700">
                  <span>📁</span><div><p className="font-medium">Folder</p><p className="text-xs text-gray-500">Multiple files</p></div>
                </button>
              </motion.div>
            )}
          </div>

          {/* Hidden Inputs */}
          <input type="file" multiple ref={fileInputRef} onChange={handleFileSelect} accept=".pdf,.doc,.docx,.xls,.xlsx" style={{ display: 'none' }} />
          <input type="file" multiple ref={photoInputRef} onChange={handleFileSelect} accept=".jpg,.jpeg,.png,.gif" style={{ display: 'none' }} />
          <input type="file" multiple webkitdirectory="true" ref={folderInputRef} onChange={handleFileSelect} style={{ display: 'none' }} />

          {/* Text Input */}
          <div className="relative flex-1">
             {input.length > 0 && <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-yellow-400 animate-pulse">✨</span>}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AI a question or make a request..."
              className="w-full pl-10 pr-28 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />

            {/* Extra Feature Buttons */}
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
             
              <button onClick={handleMicClick} type="button" title="Speak"><IoMdMic /></button>
              <button onClick={handleSpeakText} type="button" title="Read"><HiOutlineSpeakerphone /></button>
              <button onClick={handleSuggestion} type="button" title="Suggest">❓</button>
            </div>
          </div>

          {/* Send */}
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition disabled:opacity-50"
            aria-label="Send message"
          >
            <FiSend size={18} />
          </button>
        </form>
      </div>
    </footer>
  );
};

export default MessageInput;
