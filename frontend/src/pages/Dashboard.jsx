import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import { FaPlus, FaHistory, FaChartLine } from 'react-icons/fa';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contributions, setContributions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    Promise.all([
      api.get('/contributions'),
      api.get('/contributions/total')
    ])
      .then(([contribRes, totalRes]) => {
        setContributions(contribRes.data);
        setTotal(totalRes.data.total);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user, navigate]);

  if (!user) return null;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
          <h1 className="text-2xl font-bold">Welcome back, {user.name} 👋</h1>
          <p className="text-indigo-100 mt-1">Here's what's happening with your contributions</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-500 text-sm font-medium">Total Contributions</h3>
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <FaChartLine className="text-indigo-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800 mt-2">TZS {Number(total).toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-500 text-sm font-medium">Your Role</h3>
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <FaHistory className="text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold capitalize text-gray-800 mt-2">{user.role}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-500 text-sm font-medium">Faculty</h3>
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <FaPlus className="text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800 mt-2">{user.faculty?.name || 'N/A'}</p>
          </div>
        </div>

        {/* Contribution Form (Leaders only) */}
        {(user.role === 'leader' || user.role === 'admin') && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FaPlus className="mr-2 text-indigo-600" />
              Record Contribution
            </h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = {
                  member_id: formData.get('member_id'),
                  amount: formData.get('amount'),
                  contribution_date: formData.get('contribution_date') || new Date().toISOString().split('T')[0],
                  description: formData.get('description'),
                };
                try {
                  await api.post('/contributions', data);
                  alert('✅ Contribution recorded successfully!');
                  window.location.reload();
                } catch (err) {
                  alert(err.response?.data?.message || 'Error recording contribution');
                }
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="number"
                  name="member_id"
                  placeholder="Member ID"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
                  required
                />
                <input
                  type="number"
                  name="amount"
                  placeholder="Amount (TZS)"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
                  required
                />
                <input
                  type="date"
                  name="contribution_date"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
                />
                <input
                  type="text"
                  name="description"
                  placeholder="Description (optional)"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
                />
              </div>
              <button
                type="submit"
                className="mt-4 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors duration-200 flex items-center"
              >
                <FaPlus className="mr-2" />
                Record Contribution
              </button>
            </form>
          </div>
        )}

        {/* Contributions Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <FaHistory className="mr-2 text-indigo-600" />
            Recent Contributions
          </h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading...</p>
            </div>
          ) : contributions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">No contributions found</p>
              <p className="text-sm">Start by recording your first contribution</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 rounded-xl">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Description</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Recorded By</th>
                  </tr>
                </thead>
                <tbody>
                  {contributions.map((c, index) => (
                    <tr key={c.id} className={`border-t border-gray-100 ${index % 2 === 0 ? 'bg-gray-50/50' : ''}`}>
                      <td className="py-3 px-4 text-sm text-gray-700">{c.contribution_date?.split('T')[0]}</td>
                      <td className="py-3 px-4 text-sm font-semibold text-indigo-600">TZS {Number(c.amount).toLocaleString()}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{c.description || '-'}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{c.recorder?.name || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
