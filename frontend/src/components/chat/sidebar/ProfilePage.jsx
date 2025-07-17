import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loginSuccess } from '../../../features/auth/authSlice';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.auth);
  const currentUserEmail = currentUser?.email;
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    avatar: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!currentUserEmail) return;
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_BE_BASE}:${import.meta.env.VITE_BE_PORT}/user/${encodeURIComponent(currentUserEmail)}`);
        if (!response.ok) throw new Error('Failed to fetch user data');
        const data = await response.json();
        setUserData(data);
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          avatar: data.avatar || ''
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [currentUserEmail]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1];
        setFormData((prev) => ({ ...prev, avatar: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setError(null);
    if (!currentUserEmail) {
      setError('No authenticated user found');
      return;
    }
    try {
      const response = await fetch(`http://0.0.0.0:8002/user/${encodeURIComponent(currentUserEmail)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Failed to update profile');
      const updatedUser = data.user || data;
      setUserData(updatedUser);
      dispatch(loginSuccess(updatedUser));
      setFormData({
        first_name: updatedUser.first_name || '',
        last_name: updatedUser.last_name || '',
        email: updatedUser.email || '',
        avatar: updatedUser.avatar || ''
      });
      setSuccess(true);
      setEditMode(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Profile update failed');
      setTimeout(() => setError(null), 5000);
    }
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
    setError(null);
    setSuccess(false);
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Loading profile...</div>;
  if (error) return <div className="text-center text-red-500 py-10">Error: {error}</div>;
  if (!userData) return <div className="text-center py-10 text-gray-500">No user data found.</div>;

  return (
    <div className="w-full h-full p-6 bg-gradient-to-br from-dark-900 to-purple-900 rounded-2xl shadow-xl">
     <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
        <button
          onClick={toggleEditMode}
          className={`flex items-center gap-2 text-sm px-4 py-2 rounded-md transition cursor-pointer ${
            editMode ? 'bg-gray-300 hover:bg-gray-400 text-gray-800' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {editMode ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              View Profile
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Edit Profile
            </>
          )}
        </button>
      </div>

      {success && <p className="p-3 bg-green-100 text-green-700 rounded-md">Profile updated successfully!</p>}

      {editMode ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full mt-1 p-2 border rounded-md focus:ring focus:ring-indigo-200"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full mt-1 p-2 border rounded-md focus:ring focus:ring-indigo-200"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full mt-1 p-2 border rounded-md focus:ring focus:ring-indigo-200"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700">Profile Image</label> <br/>
              <input type="file" accept="image/*" onChange={handleImageChange} className="w-auto mt-1 bg-gray-100 p-1 rounded-md" />
              {formData.avatar && (
                <img
                  src={`data:image/png;base64,${formData.avatar}`}
                  alt="Avatar preview"
                  className="w-24 h-24 rounded-full mt-4 object-cover mx-auto"
                />
              )}
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-md transition"
          >
            Save Changes
          </button>
        </form>
      ) : (
        <div className="flex flex-col items-center space-y-3 h-169">
          {userData.avatar && (
            <img
              src={`data:image/png;base64,${userData.avatar}`}
              alt="User Avatar"
              className="w-24 h-24 rounded-full object-cover shadow cursor-pointer"
              onClick={() => setIsImageModalOpen(true)}
            />
          )}
          <h3 className="text-lg font-semibold">{`${userData.first_name} ${userData.last_name}`}</h3>
          <p className="text-gray-500">{userData.email}</p>
        </div>
      )}

      {isImageModalOpen && (
        <div
          onClick={() => setIsImageModalOpen(false)}
          className="absolute inset-0 flex items-center justify-center z-50 cursor-pointer"
        >
          <img
            src={`data:image/png;base64,${userData.avatar}`}
            alt="Full Avatar"
            className="h-100 w-100 rounded-full"
          />
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
