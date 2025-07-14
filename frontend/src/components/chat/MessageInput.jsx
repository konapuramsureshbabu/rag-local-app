import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiPaperclip,
  FiSend,
  FiX,
  FiEye 
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
  addToUploadHistory 
} from '../../features/ui/uiSlice';

const MessageInput = ({ input, setInput }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [localFiles, setLocalFiles] = useState([]);

  const showAttachmentOptions = useSelector(
    (state) => state.ui?.panels?.attachmentOptions?.isOpen ?? false
  );
  const selectedFiles = useSelector(
    (state) => state.ui?.fileUpload?.selectedFiles ?? []
  );
  const uploadHistory = useSelector(
    (state) => state.ui?.fileUpload?.uploadHistory ?? []
  );

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    console.log('Selected files:', files.map(f => ({ name: f.name, size: f.size })));
    if (files.length === 0) {
      console.warn('No files selected');
      return;
    }

    setLocalFiles((prev) => {
      const newFiles = [...prev, ...files];
      console.log('Updated localFiles:', newFiles.map(f => ({ name: f.name, size: f.size })));
      return newFiles;
    });

    const fileMetadata = files.map((file, index) => ({
      id: `${file.name}-${file.lastModified}-${index}`,
      name: file.name,
      size: file.size,
      type: file.type || 'unknown',
      lastModified: file.lastModified,
      isSelected: true,
      uploadProgress: 0,
      status: 'pending',
    }));
    console.log('Dispatching setSelectedFiles with:', fileMetadata);
    dispatch(setSelectedFiles(fileMetadata));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted', { selectedFiles, localFiles: localFiles.map(f => ({ name: f.name, size: f.size })) });
    setLoading(true);

    const uploadedFileUrls = [];
    const selectedToSend = selectedFiles.filter((f) => f.isSelected);
    console.log('Selected files to send:', selectedToSend);

    if (selectedToSend.length === 0) {
      console.warn('No files selected to upload');
      setLoading(false);
      setInput('');
      return;
    }

    for (let fileMeta of selectedToSend) {
      if (!fileMeta || !fileMeta.name || !fileMeta.size) {
        console.error('Invalid fileMeta:', fileMeta);
        alert('Error: Invalid file metadata');
        setLoading(false);
        return;
      }

      const file = localFiles.find(
        (f) => f.name === fileMeta.name && f.size === fileMeta.size
      );
      if (!file) {
        console.warn(`File not found for metadata:`, fileMeta);
        alert(`Error: File not found for ${fileMeta.name}`);
        continue;
      }

      const formData = new FormData();
      formData.append('file', file);

      try {
        console.log(`Uploading file: ${file.name}`);
        const res = await axios.post('http://localhost:8002/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            console.log(`Upload progress for ${file.name}: ${progress}%`);
            dispatch(updateFileUploadProgress({ index: selectedFiles.indexOf(fileMeta), progress }));
          },
        });
        console.log(`Upload response for ${file.name}:`, res.data);

        const fileData = {
          url: res.data.fileUrl,
          name: file.name,
          type: file.type || 'unknown',
          uploadedAt: new Date().toISOString(),
        };

        uploadedFileUrls.push(res.data.fileUrl);
        dispatch(addToUploadHistory(fileData));
      } catch (err) {
        console.error(`Upload error for ${fileMeta.name}:`, err);
        alert(`Error uploading file: ${fileMeta.name}`);
        setLoading(false);
        return;
      }
    }

    console.log('Uploaded file URLs:', uploadedFileUrls);
    dispatch(clearSelectedFiles());
    setLocalFiles([]);
    setInput('');
    setLoading(false);
  };

  const handleMicClick = () => {
    if (!window.webkitSpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log('Speech recognition result:', transcript);
      setInput((prev) => prev + ' ' + transcript);
    };

    recognition.onerror = (e) => {
      console.error('Speech recognition error:', e.error);
      alert('Mic error: ' + e.error);
    };

    recognition.start();
  };

  const handleSpeakText = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(input || 'No text to speak');
      utterance.lang = 'en-IN';
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech is not supported in this browser.');
    }
  };

  const handleSuggestion = () => {
    const suggestions = [
      'Summarize this document in 3 points',
      'Create a cover letter from this resume',
      'Extract tasks from this report',
      'Translate this to Hindi',
    ];
    const random = suggestions[Math.floor(Math.random() * suggestions.length)];
    console.log('Selected suggestion:', random);
    setInput(random);
  };

  const handleViewUploads = () => {
    console.log('Viewing upload history:', uploadHistory);
    if (!uploadHistory || uploadHistory.length === 0) {
      alert('No files have been uploaded yet');
      return;
    }

    alert(
      `Viewing ${uploadHistory.length} uploaded files:\n\n${uploadHistory
        .map(
          (file) =>
            `• ${file.name} (${new Date(file.uploadedAt).toLocaleString()})`
        )
        .join('\n')}`
    );
  };

  return (
    <footer className="p-4">
      <div className="max-w-3xl mx-auto relative">
        <div className="flex justify-end mb-2">
          <button
            onClick={handleViewUploads}
            className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
            title="View all uploaded files"
          >
            <div className="relative">
              <FiEye size={16} className="text-gray-600" />
              {uploadHistory.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {uploadHistory.length}
                </span>
              )}
            </div>
          </button>
        </div>

        {console.log('Rendering selectedFiles:', selectedFiles)}
        {selectedFiles.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {selectedFiles.map((fileObj, idx) => (
              <div
                key={fileObj.id || `${fileObj.name}-${fileObj.lastModified}-${idx}`}
                className="flex items-center gap-2 px-3 py-1 bg-gray-100 border border-gray-300 rounded-lg text-sm"
              >
                <input
                  type="checkbox"
                  checked={fileObj.isSelected ?? true}
                  onChange={() => dispatch(toggleFileSelection(idx))}
                  className="accent-blue-600"
                />
                <span className="truncate max-w-[140px]">{fileObj.name || 'Unnamed file'}</span>
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
        ) : (
          <div className="mb-2 text-gray-500">No files selected</div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-transparent rounded-xl shadow-lg p-4 flex items-center gap-2 w-full relative"
        >
          <div className="relative">
            <button
              type="button"
              onClick={() => dispatch(toggleAttachmentOptions())}
              className="text-gray-500 hover:text-blue-600 transition p-2 rounded-full hover:bg-gray-100 cursor-pointer"
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
                    console.log('Opening document input');
                    fileInputRef.current?.click();
                    dispatch(closeAttachmentOptions());
                  }}
                  className="w-full px-4 py-3 hover:bg-gray-50 text-left flex items-center gap-2 text-gray-700 cursor-pointer"
                >
                  <span>📄</span>
                  <div>
                    <p className="font-medium">Documents</p>
                    <p className="text-xs text-gray-500">PDF, Word, Excel</p>
                  </div>
                </button>
                <div className="border-t border-gray-200"></div>
                <button
                  type="button"
                  onClick={() => {
                    console.log('Opening photo input');
                    photoInputRef.current?.click();
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
                <div className="border-t border-gray-200"></div>
                <button
                  type="button"
                  onClick={() => {
                    console.log('Opening folder input');
                    folderInputRef.current?.click();
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
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 animate-pulse">
                ✨
              </span>
            )}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AI a question or make a request..."
              className="w-full pl-10 pr-28 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            />

            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
              <button
                onClick={handleMicClick}
                type="button"
                title="Speak"
                className="cursor-pointer"
              >
                <IoMdMic />
              </button>
              <button
                onClick={handleSpeakText}
                type="button"
                title="Read"
                className="cursor-pointer"
              >
                <HiOutlineSpeakerphone />
              </button>
              <button
                onClick={handleSuggestion}
                type="button"
                title="Suggest"
                className="cursor-pointer"
              >
                ❓
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
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