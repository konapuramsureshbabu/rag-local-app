import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import axios from 'axios';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

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

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('http://localhost:8000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('File uploaded successfully');
      setFile(null);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    }
  };

  return (
    <div>
      <h2 className="h4 text-secondary mb-3">Upload Document</h2>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border border-2 border-dashed rounded p-4 text-center ${
          isDragging ? 'border-success bg-success-subtle' : 'border-secondary bg-light'
        }`}
      >
        <Form.Group>
          <Form.Control
            type="file"
            onChange={handleFileChange}
            id="fileInput"
            className="d-none"
            accept=".txt,.pdf"
          />
          <Form.Label
            htmlFor="fileInput"
            className="cursor-pointer text-primary"
          >
            {file ? file.name : 'Click to select or drag and drop a file (TXT or PDF)'}
          </Form.Label>
        </Form.Group>
      </div>
      <Button
        onClick={handleUpload}
        disabled={!file}
        variant="primary"
        className="mt-3"
      >
        Upload
      </Button>
    </div>
  );
};

export default FileUpload;