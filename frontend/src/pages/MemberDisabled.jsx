import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MemberDisabled = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Member Dashboard</h1>
        <p className="text-gray-600 mb-6">The member dashboard is currently disabled for testing.</p>
        <button onClick={handleLogout} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
          Logout
        </button>
      </div>
    </div>
  );
};

export default MemberDisabled;
