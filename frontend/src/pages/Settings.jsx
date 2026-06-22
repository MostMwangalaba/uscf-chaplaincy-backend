import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [language, setLanguage] = useState('en');
  const [notifications, setNotifications] = useState(true);

  if (!user) return null;

  const saveSettings = () => {
    // In a real app, save to backend or localStorage
    localStorage.setItem('language', language);
    localStorage.setItem('notifications', JSON.stringify(notifications));
    alert('Settings saved!');
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Settings</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="en">English</option>
              <option value="sw">Swahili</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">Switch between English and Swahili (coming soon).</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-gray-700 font-medium">Notifications</label>
              <p className="text-sm text-gray-500">Receive email/SMS notifications</p>
            </div>
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={saveSettings}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700"
          >
            Save Settings
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
