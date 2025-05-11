import React from 'react';
import UserProfile from '../components/user/UserProfile';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const ProfilePage = () => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate(-1);
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <button 
          onClick={handleBack}
          className="flex items-center text-base dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft size={20} className="mr-1" />
          <span>Back</span>
        </button>
      </div>
      <UserProfile />
    </div>
  );
}
export default ProfilePage;