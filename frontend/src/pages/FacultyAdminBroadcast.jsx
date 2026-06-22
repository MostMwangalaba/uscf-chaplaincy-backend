import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import { FaBullhorn, FaPaperPlane } from 'react-icons/fa';

const FacultyAdminBroadcast = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    subject: '',
    message: '',
    type: 'sms',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      await api.post('/faculty/broadcast', form);
      setMessage('Broadcast sent successfully to all active members of your faculty!');
      setForm({ subject: '', message: '', type: 'sms' });
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error sending broadcast');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <FaBullhorn className="mr-2 text-indigo-600" />
            Faculty Broadcast
          </h2>
          <p className="text-gray-600 mb-6">
            Send a message to all active members of your faculty via SMS, Email, or both.
          </p>
          {message && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4">{message}</div>}
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Subject</label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Building Fund Appeal"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Message</label>
              <textarea
                rows="5"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500"
                placeholder="Type your broadcast message here..."
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Send via</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="sms">SMS</option>
                <option value="email">Email</option>
                <option value="both">Both</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Members without a registered email will receive SMS only.
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FaPaperPlane /> {loading ? 'Sending...' : 'Send Broadcast'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default FacultyAdminBroadcast;
