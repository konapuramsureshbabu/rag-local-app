import { FiSearch, FiShare2 } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { selectVersion, setVersion } from '../../features/ui/uiSlice';
import { useState } from 'react';
import {Link} from 'react-router-dom'



const ChatHeader = () => {
  const dispatch = useDispatch();
  const { current, available } = useSelector(selectVersion);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const user = useSelector((state) => state.auth.user);

  const handleShare = async () => {
    const shareData = {
      title: 'Join me in this chat',
      text: `I'm using ${current} version of this chat app. Join me!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        setShowShareDialog(true);
      }
    } catch (err) {
      console.log('Error sharing:', err);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
 
  

  return (
    <header className="border-b p-1 flex items-center justify-between">
      <div className="flex items-center space-x-3 py-3 px-3">
        <label htmlFor="version" className="text-sm font-medium text-gray-700">
          Select Version:
        </label>
        <select
          id="version"
          value={current}
          onChange={(e) => dispatch(setVersion(e.target.value))}
          className="px-5 py-1 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-transparent border border-gray-300"
          aria-label="Select AI version"
        >
          {available.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center space-x-3 p-3">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1.5 text-gray-500" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search threads..."
            className="pl-10 pr-4 py-1 border border-blue-300 rounded-full text-sm focus:ring-indigo-500 focus:border-indigo-500"
            aria-label="Search chat threads"
          />
        </div>
        <button 
          onClick={handleShare}
          className="flex items-center border border-indigo-400 bg-indigo-600 text-white px-3 py-1 rounded-md text-md hover:bg-indigo-700 transition-colors cursor-pointer "
          aria-label="Invite someone "
        >
          <FiShare2 className="mr-1" /> Invite
        </button>
          <Link to="/profile">
          <img
              src={
                user?.avatar
                  ? `data:image/png;base64,${user.avatar}`
                  : '/photos/ai-text-3d-icon-with-circuit-texture-for-artificial-intelligence-and-machine-learning-isolated-render-for-tech-articles-futuristic-concepts-data-science-modern-computing-visual-png.webp'
              }
              alt="User Profile"
              className="w-15 h-15 rounded-full object-cover border border-gray-300"
          />

          
          </Link>
              
       
        


       
      </div>

      {/* Share Dialog */}
      {showShareDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full">
            <h3 className="text-lg font-medium mb-4">Share this chat</h3>
            <div className="flex items-center border border-gray-300 rounded-md p-2 mb-4">
              <input
                type="text"
                readOnly
                value={window.location.href}
                className="flex-1 outline-none text-sm"
              />
              <button 
                onClick={copyToClipboard}
                className="ml-2 px-3 py-1 bg-indigo-600 text-white rounded text-sm"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => setShowShareDialog(false)}
                className="px-4 py-2 text-gray-700 rounded-md text-sm hover:bg-gray-100 "
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default ChatHeader;