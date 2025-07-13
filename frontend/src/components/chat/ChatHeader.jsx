import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setVersion } from '../../features/ui/uiSlice';

const ChatHeader = () => {
  const dispatch = useDispatch();
  const { version, uploadHistory } = useSelector((state) => state.ui);
  const [selectedVersion, setSelectedVersion] = useState(version || 'v1.0');

  const handleVersionChange = (e) => {
    const newVersion = e.target.value;
    setSelectedVersion(newVersion);
    dispatch(setVersion(newVersion));
  };

  // Ensure uploadHistory is an array, default to empty if undefined
  const recentUploads = uploadHistory || [];

  return (
    <header className="bg-white p-4 border-b flex justify-between items-center">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold">RAG Assistant</h1>
        <select
          value={selectedVersion}
          onChange={handleVersionChange}
          className="border rounded p-1"
        >
          <option value="v1.0">v1.0</option>
          <option value="v2.0">v2.0</option>
        </select>
        <div className="ml-4">
          <h3 className="text-sm font-medium">Recent Uploads:</h3>
          {recentUploads.length > 0 ? (
            <ul className="text-xs text-gray-600">
              {recentUploads.map((file, index) => (
                <li key={index}>{file.name || 'Unnamed File'}</li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-gray-500">No uploads yet</p>
          )}
        </div>
      </div>
      <div>
        <input
          type="text"
          placeholder="Search threads..."
          className="border rounded p-2"
        />
        <button className="ml-2 bg-blue-500 text-white p-2 rounded">Invite</button>
      </div>
    </header>
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
      return <div>Something went wrong in the header. Please try again.</div>;
    }
    return this.props.children;
  }
}

export default () => (
  <ErrorBoundary>
    <ChatHeader />
  </ErrorBoundary>
);