import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { FiPaperclip, FiSend, FiX, FiEye, FiUpload } from "react-icons/fi";
import { IoMdMic } from "react-icons/io";
import { HiOutlineSpeakerphone } from "react-icons/hi";
import axios from "axios";
import {
  toggleAttachmentOptions,
  closeAttachmentOptions,
  setSelectedFiles,
  removeSelectedFile,
  clearSelectedFiles,
  addToUploadHistory,
  clearUploadHistory,
  updateFileUploadProgress,
} from "../../features/ui/uiSlice";
import { addMessage } from "../../features/chat/chatSlice";

const MessageInput = ({ input, setInput, ws, fetchFiles, fetchFileById, setActiveFile, deleteFile, deleteAllFiles }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [localFiles, setLocalFiles] = useState([]);
  const [showUploadHistory, setShowUploadHistory] = useState(false);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const showAttachmentOptions = useSelector(
    (state) => state.ui?.panels?.attachmentOptions?.isOpen ?? false
  );
  const selectedFiles = useSelector(
    (state) => state.ui?.fileUpload?.selectedFiles ?? []
  );
  const uploadHistory = useSelector(
    (state) => state.ui?.fileUpload?.uploadHistory ?? []
  );

  // Debug uploadHistory changes
  useEffect(() => {
    console.log("aa", uploadHistory);
  }, [uploadHistory,selectedFiles]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) {
      console.warn("No files selected");
      return;
    }

    setLocalFiles((prev) => {
      const newFiles = [...prev, ...files];
      return newFiles;
    });

    const fileMetadata = files.map((file, index) => ({
      id: `${file.name}-${file.lastModified}-${index}`,
      name: file.name,
      size: file.size,
      type: file.type || "unknown",
      lastModified: file.lastModified,
      isSelected: true,
      uploadProgress: 0,
      status: "pending",
    }));
    dispatch(setSelectedFiles(fileMetadata));
  };

  const handleFileUpload = async () => {
    setLoading(true);
    const uploadedFileUrls = [];
    const selectedToSend = selectedFiles.filter((f) => f.isSelected);

    if (selectedToSend.length === 0) {
      console.warn("No files selected to upload");
      setLoading(false);
      return;
    }

    for (let fileMeta of selectedToSend) {
      if (!fileMeta || !fileMeta.name || !fileMeta.size) {
        console.error("Invalid file metadata:", fileMeta);
        alert("Error: Invalid file metadata");
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
      formData.append("file", file);

      try {
        console.log(`Uploading file: ${file.name}`);
        const res = await axios.post(
          `${import.meta.env.VITE_BE_BASE}:${import.meta.env.VITE_BE_PORT}/upload`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (progressEvent) => {
              const progress = Math.round(
                (progressEvent.loaded / progressEvent.total) * 100
              );
              dispatch(
                updateFileUploadProgress({
                  index: selectedFiles.indexOf(fileMeta),
                  progress,
                })
              );
            },
          }
        );
        console.log(`Upload response for ${file.name}:`, res.data);

        const fileData = {
          id: res.data.id || `${file.name}-${Date.now()}`,
          filename: file.name,
          filepath: res.data.fileUrl,
          is_active: false,
        };

        if (fileData.id && fileData.filename && fileData.filepath) {
          uploadedFileUrls.push(res.data.fileUrl);
          dispatch(
            addToUploadHistory({ 0: fileData, date: new Date().toISOString() })
          );
          setFiles((prev) => [...prev, fileData]);
        } else {
          console.warn(`Invalid fileData for ${file.name}:`, fileData);
        }
      } catch (err) {
        console.error(`Upload error for ${fileMeta.name}:`, err);
        alert(`Error uploading file: ${fileMeta.name}`);
        setLoading(false);
        continue;
      }
    }

    dispatch(clearSelectedFiles());
    setLocalFiles([]);
    setLoading(false);
    await fetchFiles();
  };

  const handleMessageSend = (e) => {
    e.preventDefault();
    if (ws && ws.readyState === WebSocket.OPEN && input.trim()) {
      const message = { text: input.trim(), sender: "user" };
      dispatch(addMessage(message))
      ws.send(JSON.stringify(message));
      setInput("");
    } else {
      console.error("Cannot send message: WebSocket not open or input empty");
      alert("Cannot send message: WebSocket not connected or input empty");
    }
  };

  const handleMicClick = () => {
    if (!window.webkitSpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + " " + transcript);
    };

    recognition.onerror = (e) => {
      alert("Mic error: " + e.error);
    };

    recognition.start();
  };

  const handleSpeakText = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(input || "No text to speak");
      utterance.lang = "en-IN";
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech is not supported in this browser.");
    }
  };

  const handleSuggestion = () => {
    const suggestions = [
      "Summarize this document in 3 points",
      "Create a cover letter from this resume",
      "Extract tasks from this report",
      "Translate this to Hindi",
    ];
    const random = suggestions[Math.floor(Math.random() * suggestions.length)];
    setInput(random);
  };

  const handleViewUploads = () => {
    setShowUploadHistory((prev) => !prev);
    if (!showUploadHistory) {
      fetchFiles();
    }
  };

  return (
    <footer className="p-4">
      <div className="relative">
        <form
          onSubmit={handleMessageSend}
          className="bg-transparent rounded-xl shadow-lg p-4 flex items-center gap-2 w-full relative"
        >
          <div className="relative">
           <div className="flex flex-row">
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
            <button
            type="button" // Add this to prevent form submission
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
          {showUploadHistory && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-[1001] bg-white border border-gray-200 rounded-lg shadow-lg w-80 max-h-96 overflow-y-auto bottom-full mb-2 left "          >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-800">Upload History</h3>
              <div className="flex gap-2">
                <button
                  onClick={deleteAllFiles}
                  className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                  aria-label="Delete all files"
                >
                  Delete All
                </button>
                <button
                  onClick={() => setShowUploadHistory(false)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Close upload history"
                >
                  <FiX size={16} />
                </button>
              </div>
            </div>
            {uploadHistory.length > 0 ? (
              <ul className="p-4 space-y-2">
                {uploadHistory
                  .filter((entry) => {
                    const isValid =
                      entry[0] &&
                      entry[0].id &&
                      entry[0].filename &&
                      entry[0].filepath &&
                      entry.date;
                    if (!isValid) {
                      console.warn("Invalid uploadHistory entry:", entry);
                    }
                    return isValid;
                  })
                  .map((entry, index) => (
                    <li
                      key={`${entry[0].id}-${index}`}
                      className={`flex items-center justify-between gap-2 p-2 rounded-lg ${
                        entry[0].is_active ? "bg-blue-100" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex flex-col flex-1">
                        <div className="flex items-center gap-2">
                          <a
                            href={entry[0].filepath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline truncate max-w-[180px]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {entry[0].filename}
                          </a>
                          <button
                            onClick={() => deleteFile(entry[0].id)}
                            className="text-red-500 hover:text-red-700"
                            aria-label={`Delete ${entry[0].filename}`}
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500">
                          Status: {entry[0].is_active ? "Active" : "Inactive"} | Uploaded:{" "}
                          {new Date(entry.date).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => fetchFileById(entry[0].id)}
                        className={`px-2 py-1 text-sm rounded-lg ${
                          entry[0].is_active
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-blue-200"
                          }`}
                        aria-label={`Set ${entry[0].filename} as active`}
                      >
                        {entry[0].is_active ? "Active" : "Set Active"}
                      </button>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="p-4 text-gray-500 text-sm">No files uploaded yet.</p>
            )}
          </motion.div>
        )}

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
                <span className="truncate max-w-[140px]">{fileObj.name || "Unnamed file"}</span>
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
          <div className="mb-2 text-gray-500"></div>
        )}
           </div>
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
                    console.log("Opening document input");
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
                    console.log("Opening photo input");
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
                    console.log("Opening folder input");
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
            style={{ display: "none" }}
          />
          <input
            type="file"
            multiple
            ref={photoInputRef}
            onChange={handleFileSelect}
            accept=".jpg,.jpeg,.png,.gif"
            style={{ display: "none" }}
          />
          <input
            type="file"
            multiple
            webkitdirectory="true"
            ref={folderInputRef}
            onChange={handleFileSelect}
            style={{ display: "none" }}
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
            type="button"
            onClick={handleFileUpload}
            disabled={loading || selectedFiles.length === 0}
            className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition disabled:opacity-50 cursor-pointer"
            aria-label="Upload files"
          >
            <FiUpload size={18} />
          </button>
          <button
            type="submit"
            disabled={loading || !input.trim()}
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