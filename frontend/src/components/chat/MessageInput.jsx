import React from 'react';
import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiPaperclip,
  FiSend,
  FiX,
  FiEye,
  FiChevronDown,
  FiChevronUp,
  FiPlus,
  FiMinus
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
  addToUploadHistory,
  toggleUploadHistoryModal,
  setSelectedUploads,
  addFromUploadHistory,
  setUploadHistory
} from '../../features/ui/uiSlice';

const MessageInput = ({ input, setInput }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef();
  const photoInputRef = useRef();
  const folderInputRef = useRef();
  const dropdownRef = useRef();
  const [loading, setLoading] = useState(false);
  const [showUploadsDropdown, setShowUploadsDropdown] = useState(false);
  const [localFiles, setLocalFiles] = useState({});

  const { 
    showAttachmentOptions, 
    selectedFiles, 
    uploadHistory,
    showUploadHistoryModal,
    selectedUploads
  } = useSelector((state) => state.ui);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUploadsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMicClick = () => {
    if ('webkitSpeechRecognition' in window) {
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
    } else {
      alert('Speech recognition not supported in this browser');
    }
  };

  const handleSpeakText = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(input || 'No text to speak');
      utterance.lang = 'en-IN';
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech not supported in this browser');
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

  const handleViewUploads = () => {
    if (uploadHistory.length === 0) {
      alert('No files have been uploaded yet');
      return;
    }
    setShowUploadsDropdown(!showUploadsDropdown);
  };

  const handleToggleUploadSelection = (index) => {
    const safeSelectedUploads = selectedUploads || [];
    const newSelection = safeSelectedUploads.includes(index)
      ? safeSelectedUploads.filter(i => i !== index)
      : [...safeSelectedUploads, index];
    dispatch(setSelectedUploads(newSelection));
  };

  const handleAddSelectedUploads = () => {
    const safeSelectedUploads = selectedUploads || [];
    const filesToAdd = safeSelectedUploads.map(index => ({
      name: uploadHistory[index]?.name || `File_${index}`,
      type: uploadHistory[index]?.type || 'unknown',
      lastModified: new Date(uploadHistory[index]?.uploadedAt || Date.now()).getTime(),
      isSelected: true,
      fromHistory: true,
      historyUrl: uploadHistory[index]?.url || ''
    }));
    
    dispatch(setSelectedFiles([...selectedFiles, ...filesToAdd]));
    dispatch(setSelectedUploads([]));
    dispatch(toggleUploadHistoryModal());
  };

  const handleAddSingleFile = (file) => {
    const fileToAdd = {
      name: file.name,
      type: file.type,
      lastModified: new Date(file.uploadedAt).getTime(),
      isSelected: true,
      fromHistory: true,
      historyUrl: file.url
    };
    dispatch(setSelectedFiles([...selectedFiles, fileToAdd]));
    setShowUploadsDropdown(false);
  };

  const handleRemoveFileFromHistory = (index) => {
    const newUploadHistory = uploadHistory.filter((_, i) => i !== index);
    dispatch(setUploadHistory(newUploadHistory));
  };

  const handleReadSelectedFiles = () => {
    const safeSelectedUploads = selectedUploads || [];
    const selected = uploadHistory.filter((_, index) => 
      safeSelectedUploads.includes(index)
    );
    console.log('Files to process:', selected);
    alert(`Processing ${selected.length} selected files`);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const newFiles = files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      isSelected: true
    }));
    
    const newLocalFiles = files.reduce((acc, file) => ({
      ...acc,
      [`${file.name}-${file.lastModified}`]: file
    }), {});
    
    setLocalFiles(prev => ({ ...prev, ...newLocalFiles }));
    dispatch(setSelectedFiles([...selectedFiles, ...newFiles]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input && selectedFiles.length === 0) return;

    setLoading(true);
    try {
      const uploadPromises = selectedFiles
        .filter(f => f.isSelected && !f.fromHistory)
        .map(async file => {
          const fileObj = localFiles[`${file.name}-${file.lastModified}`];
          if (!fileObj) throw new Error(`File ${file.name} not found in local state`);
          
          const formData = new FormData();
          formData.append('file', fileObj);
          const res = await axios.post('http://localhost:8002/upload', formData);
          
          dispatch(addToUploadHistory({
            name: file.name,
            type: file.type,
            url: res.data.fileUrl,
            uploadedAt: new Date().toISOString()
          }));
          
          return res.data.fileUrl;
        });

      const uploadedFileUrls = await Promise.all(uploadPromises);

      const message = {
        text: input,
        files: [
          ...uploadedFileUrls,
          ...selectedFiles.filter(f => f.isSelected && f.fromHistory).map(f => f.historyUrl)
        ]
      };

      console.log('Message sent:', message);
      dispatch(clearSelectedFiles());
      setLocalFiles({});
      setInput('');
    } catch (err) {
      console.error('Upload error:', err);
      alert('Error uploading files');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-white border-t p-4">
      <div className="max-w-3xl mx-auto relative">
        <div className="flex justify-end mb-2 relative">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={handleViewUploads}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
              title="View uploaded files"
            >
              <div className="relative">
                <FiEye size={16} className="text-gray-600" />
                {uploadHistory?.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {uploadHistory.length}
                  </span>
                )}
              </div>
              <span className="text-sm hidden sm:inline">Uploads</span>
              {showUploadsDropdown ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </button>

            {showUploadsDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute z-50 right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-xl overflow-y-auto max-h-[70vh]"
                style={{ top: '100%' }}
              >
                <div className="p-3 m-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                  <h4 className="font-medium text-sm text-gray-700">Recent Uploads</h4>
                  <button 
                    onClick={() => {
                      setShowUploadsDropdown(false);
                      dispatch(toggleUploadHistoryModal());
                    }}
                    className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                  >
                    View All
                  </button>
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                  {uploadHistory.length === 0 ? (
                    <div className="p-4 text-center">
                      <div className="text-gray-400 mb-2">
                        <FiPaperclip size={24} className="mx-auto" />
                      </div>
                      <p className="text-sm text-gray-500">No files uploaded yet</p>
                      <p className="text-xs text-gray-400 mt-1">Upload files to get started</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {uploadHistory.map((file, index) => (
                        <li 
                          key={index} 
                          className="flex items-center p-3 hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            {file.type.includes('pdf') ? (
                              <span className="text-blue-600">📄</span>
                            ) : file.type.includes('image') ? (
                              <span className="text-blue-600">🖼️</span>
                            ) : (
                              <span className="text-blue-600">📁</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                            <div className="flex items-center mt-1">
                              <span className="text-xs text-gray-500">
                                {new Date(file.uploadedAt).toLocaleDateString()}
                              </span>
                              <span className="mx-2 text-gray-300">•</span>
                              <span className="text-xs text-gray-500">
                                {file.type.split('/')[1]?.toUpperCase() || file.type}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddSingleFile(file);
                              }}
                              className="p-1 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-100"
                              title="Add to message"
                            >
                              <FiPlus size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFileFromHistory(index);
                              }}
                              className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-100"
                              title="Remove from history"
                            >
                              <FiMinus size={16} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                
                {uploadHistory.length > 5 && (
                  <div className="p-2 border-t border-gray-100 bg-gray-50 text-center">
                    <button
                      onClick={() => {
                        setShowUploadsDropdown(false);
                        dispatch(toggleUploadHistoryModal());
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View all {uploadHistory.length} files
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {selectedFiles.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {selectedFiles.map((fileObj, idx) => (
              <div
                key={`${fileObj.name}-${fileObj.lastModified}`}
                className="flex items-center gap-2 px-3 py-1 bg-gray-100 border border-gray-300 rounded-lg text-sm"
              >
                <input
                  type="checkbox"
                  checked={fileObj.isSelected}
                  onChange={() => dispatch(toggleFileSelection(idx))}
                  className="accent-blue-600"
                />
                <span className="truncate max-w-[140px]">{fileObj.name}</span>
                <button
                  onClick={() => {
                    dispatch(removeSelectedFile(idx));
                    setLocalFiles(prev => {
                      const newLocalFiles = { ...prev };
                      delete newLocalFiles[`${fileObj.name}-${fileObj.lastModified}`];
                      return newLocalFiles;
                    });
                  }}
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
                <button 
                  type="button" 
                  onClick={() => { 
                    fileInputRef.current.click(); 
                    dispatch(closeAttachmentOptions()); 
                  }} 
                  className="w-full px-4 py-3 hover:bg-gray-50 text-left flex items-center gap-2 text-gray-700"
                >
                  <span>📄</span>
                  <div>
                    <p className="font-medium">Documents</p>
                    <p className="text-xs text-gray-500">PDF, Word, Excel</p>
                  </div>
                </button>
                <div className="border-t border-gray-100"></div>
                <button 
                  type="button" 
                  onClick={() => { 
                    photoInputRef.current.click(); 
                    dispatch(closeAttachmentOptions()); 
                  }} 
                  className="w-full px-4 py-3 hover:bg-gray-50 text-left flex items-center gap-2 text-gray-700"
                >
                  <span>🖼️</span>
                  <div>
                    <p className="font-medium">Photos</p>
                    <p className="text-xs text-gray-500">JPG, PNG, GIF</p>
                  </div>
                </button>
                <div className="border-t border-gray-100"></div>
                <button 
                  type="button" 
                  onClick={() => { 
                    folderInputRef.current.click(); 
                    dispatch(closeAttachmentOptions()); 
                  }} 
                  className="w-full px-4 py-3 hover:bg-gray-50 text-left flex items-center gap-2 text-gray-700"
                >
                  <span>📁</span>
                  <div>
                    <p className="font-medium">Folder</p>
                    <p className="text-xs text-gray-500">Multiple files</p>
                  </div>
                </button>
              </motion.div>
            )}
          </div>

          <input 
            type="file" 
            multiple 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            accept=".pdf,.doc,.docx,.xls,.xlsx" 
            style={{ display: 'none' }} 
          />
          <input 
            type="file" 
            multiple 
            ref={photoInputRef} 
            onChange={handleFileSelect} 
            accept=".jpg,.jpeg,.png,.gif" 
            style={{ display: 'none' }} 
          />
          <input 
            type="file" 
            multiple 
            webkitdirectory="true" 
            ref={folderInputRef} 
            onChange={handleFileSelect} 
            style={{ display: 'none' }} 
          />

          <div className="relative flex-1">
            {input.length > 0 && (
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-400 animate-pulse">
                ✨
              </span>
            )}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AI a question or make a request..."
              className="w-full pl-10 pr-28 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />

            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
              <button onClick={handleMicClick} type="button" title="Speak">
                <IoMdMic />
              </button>
              <button onClick={handleSpeakText} type="button" title="Read">
                <HiOutlineSpeakerphone />
              </button>
              <button onClick={handleSuggestion} type="button" title="Suggest">
                ❓
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition disabled:opacity-50"
            aria-label="Send message"
          >
            <FiSend size={18} />
          </button>
        </form>

        {showUploadHistoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Select Files to Attach</h3>
                <button 
                  onClick={() => {
                    dispatch(toggleUploadHistoryModal());
                    dispatch(setSelectedUploads([]));
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX size={20} />
                </button>
              </div>
              
              <div className="space-y-2 mb-4 max-h-[60vh] overflow-y-auto">
                {uploadHistory.map((file, index) => (
                  <div key={index} className="flex items-center p-2 hover:bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      checked={(selectedUploads || []).includes(index)} // Safe check
                      onChange={() => handleToggleUploadSelection(index)}
                      className="mr-3 h-4 w-4"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(file.uploadedAt).toLocaleString()} • {file.type.split('/')[1] || file.type}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t">
                <button
                  onClick={handleReadSelectedFiles}
                  disabled={(selectedUploads || []).length === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
                >
                  Read Selected {((selectedUploads || []).length)}
                </button>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      dispatch(toggleUploadHistoryModal());
                      dispatch(setSelectedUploads([]));
                    }}
                    className="px-4 py-2 border rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddSelectedUploads}
                    disabled={(selectedUploads || []).length === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                  >
                    Add to Message {((selectedUploads || []).length)}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
};

// Error Boundary
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong with the input. Please try again.</div>;
    }
    return this.props.children;
  }
}

export default () => (
  <ErrorBoundary>
    <MessageInput input="" setInput={() => {}} />
  </ErrorBoundary>
);