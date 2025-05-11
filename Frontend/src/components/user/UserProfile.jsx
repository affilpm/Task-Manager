import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../../slices/userSlice';
import axiosInstance from '../../api/api';
import { toast } from 'react-toastify';
import useDarkMode from '../../hooks/useDarkMode';

const UserProfile = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  // Use the dark mode hook to detect system theme
  const isDarkMode = useDarkMode();
  
  // Profile form state
  const [fullName, setFullName] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState({});
  
  // Loading states
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  useEffect(() => {
    // Fetch user profile data when component mounts
    fetchUserProfile();
  }, []);

  useEffect(() => {
    // Update local state when Redux state changes
    setFullName(user.fullName);
  }, [user.fullName]);

  const fetchUserProfile = async () => {
    try {
      const response = await axiosInstance.get('/users/profile/');
      dispatch(setUser({
        fullName: response.data.full_name,
        email: response.data.email
      }));
    } catch (error) {
      toast.error('Failed to load profile');
      console.error('Error fetching profile:', error);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    
    try {
      const response = await axiosInstance.patch('/users/profile/', {
        full_name: fullName
      });
      
      dispatch(setUser({
        ...user,
        fullName: response.data.full_name
      }));
      
      setIsEditingProfile(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Error updating profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordErrors({});
    
    // Client-side validation
    if (newPassword !== confirmPassword) {
      setPasswordErrors({
        confirm_password: ['Passwords do not match']
      });
      return;
    }
    
    setLoadingPassword(true);
    
    try {
      await axiosInstance.post('/users/change-password/', {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      
      // Reset form fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      toast.success('Password changed successfully');
    } catch (error) {
      const errorData = error.response?.data || {};
      setPasswordErrors(errorData);
      toast.error('Failed to change password');
      console.error('Error changing password:', error);
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">User Profile</h1>
      
      {/* Profile Information Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Profile Information</h2>
        
        <form onSubmit={handleProfileSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 dark:text-gray-200"
              value={user.email}
              disabled
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Full Name</label>
            {isEditingProfile ? (
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            ) : (
              <div className="flex justify-between items-center">
                <span className="py-2 dark:text-gray-200">{user.fullName}</span>
                <button
                  type="button"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  onClick={() => setIsEditingProfile(true)}
                >
                  Edit
                </button>
              </div>
            )}
          </div>
          
          {isEditingProfile && (
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200"
                onClick={() => {
                  setIsEditingProfile(false);
                  setFullName(user.fullName);
                }}
                disabled={loadingProfile}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loadingProfile}
              >
                {loadingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
      
      {/* Change Password Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Change Password</h2>
        
        <form onSubmit={handlePasswordSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Current Password</label>
            <input
              type="password"
              className={`w-full px-3 py-2 border ${
                passwordErrors.current_password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200`}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            {passwordErrors.current_password && (
              <p className="text-red-500 text-sm mt-1">{passwordErrors.current_password[0]}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">New Password</label>
            <input
              type="password"
              className={`w-full px-3 py-2 border ${
                passwordErrors.new_password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200`}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            {passwordErrors.new_password && (
              <p className="text-red-500 text-sm mt-1">{passwordErrors.new_password[0]}</p>
            )}
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Confirm New Password</label>
            <input
              type="password"
              className={`w-full px-3 py-2 border ${
                passwordErrors.confirm_password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {passwordErrors.confirm_password && (
              <p className="text-red-500 text-sm mt-1">{passwordErrors.confirm_password[0]}</p>
            )}
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loadingPassword}
            >
              {loadingPassword ? 'Changing Password...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;