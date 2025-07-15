import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

// Mock Redux actions
const updateProfileStart = () => ({ type: 'UPDATE_PROFILE_START' });
const updateProfileSuccess = (user) => ({ type: 'UPDATE_PROFILE_SUCCESS', payload: user });
const updateProfileFailure = (error) => ({ type: 'UPDATE_PROFILE_FAILURE', payload: error });

const ProfilePage = () => {
  const dispatch = useDispatch();
   const { user: currentUser } = useSelector(state => state.auth); // Get user from auth state
  
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch user data on component mount
  useEffect(() => {
    if (!currentUser?.email) return;
    const currentUserEmail = currentUser.email; // Use email from current user
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://0.0.0.0:8002/user/${encodeURIComponent(currentUserEmail)}`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const data = await response.json();
        setUserData(data);
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || ''
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser?.email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setSuccess(false);
  setError(null);
  
  // Get current user email from Redux auth state
  const currentUserEmail = useSelector(state => state.auth.user?.email);
  
  if (!currentUserEmail) {
    setError('No authenticated user found');
    return;
  }

  dispatch(updateProfileStart());
  try {
    const response = await fetch(`http://0.0.0.0:8002/user/${encodeURIComponent(currentUserEmail)}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Add authorization header if your API requires it
        // 'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle API validation errors (assuming they return in {detail: ...} format)
      throw new Error(data.detail || 'Failed to update profile');
    }

    const updatedUser = data.user || data; // Handle different API response structures
    
    // Update local state
    setUserData(updatedUser);
    
    // Update Redux auth state with new user data
    dispatch(loginSuccess(updatedUser)); // Reuse your loginSuccess action
    
    // Update local form data in case API transformed any values
    setFormData({
      first_name: updatedUser.first_name || '',
      last_name: updatedUser.last_name || '',
      email: updatedUser.email || ''
    });
    
    // Show success feedback
    setSuccess(true);
    setEditMode(false);
    
    // Clear success message after 3 seconds
    const timer = setTimeout(() => setSuccess(false), 3000);
    
    // Clean up timer if component unmounts
    return () => clearTimeout(timer);
    
  } catch (err) {
    console.error('Profile update error:', err);
    
    // Handle different error types
    const errorMessage = err.response?.data?.message || 
                        err.message || 
                        'Profile update failed';
    
    setError(errorMessage);
    dispatch(updateProfileFailure(errorMessage));
    
    // Auto-clear error after 5 seconds
    const errorTimer = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(errorTimer);
  }
};

  const toggleEditMode = () => {
    setEditMode(!editMode);
    setError(null);
    setSuccess(false);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto mt-10 p-6 rounded-lg shadow-md text-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md text-center text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md text-center">
        <p>No user data found</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl mx-auto mt-10 p-8 mb-5 rounded-lg shadow-md bg-gradient-to-br from-dark-900 to-purple-400 overflow-y-auto scrollbar-hide">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">My Profile</h2>
        <button
          onClick={toggleEditMode}
          className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition-colors"
        >
          {editMode ? 'View Profile' : 'Edit Profile'}
        </button>
      </div>
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          Profile updated successfully!
        </div>
      )}
      
      {editMode ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              className="bg-indigo-600 text-white py-2 px-6 rounded hover:bg-indigo-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            
            <button
              type="button"
              onClick={toggleEditMode}
              className="bg-gray-200 text-gray-800 py-2 px-6 rounded hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
          
          {error && (
            <div className="text-red-500 text-sm mt-2">
              Error: {error}
            </div>
          )}
        </form>
      ) : (
        <div className="space-y-4">
          {userData.avatar && (
            <div className="flex justify-center mb-4">
              <img
                src={`data:image/png;base64,${userData.avatar}`}
                alt="Profile avatar"
                className="w-24 h-24 rounded-full object-cover"
              />
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">First Name</h3>
              <p className="mt-1 text-gray-900">{userData.first_name}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Last Name</h3>
              <p className="mt-1 text-gray-900">{userData.last_name}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <p className="mt-1 text-gray-900">{userData.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;