// FileUpload.js
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button } from 'react-bootstrap';
import { toggleFileUpload } from "../features/ui/uiSlice";
import axios from 'axios';

const FileUpload = ({ compact = false }) => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const dispatch = useDispatch();
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


  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    setFile(event.dataTransfer.files[0]);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file');
      return;
    }
  
    // Create a FormData object and append the file
    const formData = new FormData();
    formData.append('file', file); // 'file' is the field name expected by the server
  
    try {
      await axios.post('http://localhost:8002/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFile(null);
      dispatch(toggleFileUpload());
      addToast('Uplodes file successfully', 'success');
    } catch (error) {
      console.error('Error uploading file:', error); 
      alert('Error uploading file');
    }
  };

  return (
    <div className={compact ? '' : 'p-4'}>
         {/* <div className="fixed top-4 right-4 z-50 space-y-2">
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
      </div> */}
      {/* <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg text-center p-3 ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
        }`}
      >
        <input
          type="file"
          onChange={handleFileChange}
          id="fileInput"
          className="hidden"
          accept=".txt,.pdf,.doc,.docx"
        />
        <label htmlFor="fileInput" className="cursor-pointer block">
          <div className="flex flex-col items-center justify-center text-xs">
            📎 <span className="font-medium">Click or drag to upload</span>
          </div>
        </label>
      </div>

      {file && (
        <div className="mt-2 text-sm text-left text-gray-700 truncate">
          {file.name} – {(file.size / (1024 * 1024)).toFixed(2)} MB
        </div>
      )}

      <div className="mt-2 flex justify-end space-x-2">
        <Button size="sm" variant="outline-secondary" onClick={() => dispatch(toggleFileUpload())} className='bg-red-200 hover:bg-gray-300 px-3  py-1 rounded-sm'>
          Cancel
        </Button>
        <Button size="sm" onClick={handleUpload} disabled={!file} variant="primary" className='bg-blue-200 hover:bg-gray-300 px-3  py-1 rounded-sm'>
          Upload
        </Button>
      </div> */}
    </div>
  );
};
export default FileUpload;
