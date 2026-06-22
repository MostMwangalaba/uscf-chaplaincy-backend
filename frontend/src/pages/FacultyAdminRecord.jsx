import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import { FaPlus, FaSearch, FaDollarSign } from 'react-icons/fa';

const FacultyAdminRecord = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    member_id: '',
    amount: '',
    contribution_date: new Date().toISOString().split('T')[0],
    description: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const data = {
        member_id: form.member_id,
        amount: form.amount,
        contribution_date: form.contribution_date,
        description: form.description || 'Building Fund',
      };
      const res = await api.post('/contributions', data);
      setSuccess(`Contribution recorded successfully! SMS sent to ${res.data.member.mobile}`);
      setForm({
        member_id: '',
        amount: '',
        contribution_date: new Date().toISOString().split('T')[0],
        description: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Error recording contribution');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <FaPlus className="mr-3 text-indigo-600" />
            Record Building Fund Contribution
          </h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4">
              ✅ {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Member ID</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  className="w-full border border-gray-200 rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
                  placeholder="Enter member ID"
                  value={form.member_id}
                  onChange={(e) => setForm({ ...form, member_id: e.target.value })}
                  required
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">You can also use the member's ID from their profile</p>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Amount (TZS)</label>
              <div className="relative">
                <FaDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  className="w-full border border-gray-200 rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
                  placeholder="Enter amount"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Date</label>
              <input
                type="date"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
                value={form.contribution_date}
                onChange={(e) => setForm({ ...form, contribution_date: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Description (Optional)</label>
              <input
                type="text"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
                placeholder="e.g., Building Fund - Sunday Service"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Recording...' : 'Record Contribution'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default FacultyAdminRecord;
