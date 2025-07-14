import { FiUser, FiSettings, FiClock, FiLogOut } from 'react-icons/fi';
import { RiChatNewLine } from "react-icons/ri";
import { useDispatch, useSelector } from 'react-redux';

import { useNavigate } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import { Link } from 'react-router-dom';
import { TfiFiles } from "react-icons/tfi";

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  return (
    <nav className="w-10 md:w-50 bg-gray-900 text-white flex flex-col">
      <div className="p-4 flex items-center justify-center md:justify-start">
        <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
          <span className="font-bold">AI</span>
        </div>
        <span className="ml-2 hidden md:block font-bold">RAG Assistant</span>
      </div>
      <div className="mt-8 flex-1">
        <button
          className="w-full p-3 flex items-center justify-center md:justify-start hover:bg-gray-800"
          aria-label="New Chat"
        >
          <RiChatNewLine className="text-lg" />
          <span className="ml-2 hidden md:block"><Link to='/NewChat' className="flex items-center">
          New Chat
          </Link></span>
          
        </button>
         <button
          className="w-full p-3 flex items-center justify-center md:justify-start hover:bg-gray-800"
          aria-label="Settings"
        >
         <TfiFiles className="text-lg" />
          <Link to='/fileUploads'>
          <span className="ml-2 hidden md:block">Upload History</span>
          </Link>
        </button>
        
        <button
          className="w-full p-3 flex items-center justify-center md:justify-start hover:bg-gray-800"
          aria-label="Profile"
        >
          <FiUser className="text-lg" /><Link to='/Profile' className="flex items-center">
          <span className="ml-2 hidden md:block">Profile</span>
          </Link>
        </button>
        
        <button
          className="w-full p-3 flex items-center justify-center md:justify-start hover:bg-gray-800"
          aria-label="History"
        >
          <FiClock className="text-lg" />
          <Link to='/History'>
          <span className="ml-2 hidden md:block">History</span></Link>
        </button>
        
        <button
          className="w-full p-3 flex items-center justify-center md:justify-start hover:bg-gray-800"
          aria-label="Settings"
        >
          <FiSettings className="text-lg" />
          <Link to='/Settings'>
          <span className="ml-2 hidden md:block">Settings</span>
          </Link>
        </button>
        
        <button
          className="w-full p-3 flex items-center justify-center md:justify-start hover:bg-gray-800"
          onClick={() => {
            dispatch(logout());
            navigate('/login');
          }}
          aria-label="Logout"
        >
          <FiLogOut className="text-lg" />
          <span className="ml-2 hidden md:block">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;