import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';

const MemberContributions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchContributions();
  }, [user, navigate]);

  const fetchContributions = () => {
    setLoading(true);
    api.get('/contributions')
      .then(res => {
        // Filter by date if provided
        let filtered = res.data;
        if (startDate) {
          filtered = filtered.filter(c => c.contribution_date >= startDate);
        }
        if (endDate) {
          filtered = filtered.filter(c => c.contribution_date <= endDate);
        }
        setContributions(filtered);
        const sum = filtered.reduce((acc, c) => acc + Number(c.amount), 0);
        setTotal(sum);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleFilter = (e) => {
    e.preventDefault();
    fetchContributions();
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">My Contributions</h2>
          
          <form onSubmit={handleFilter} className="flex flex-wrap gap-4 mb-6">
            <div>
              <label className="block text-sm text-gray-600">From</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">To</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                Filter
              </button>
            </div>
          </form>

          <div className="bg-indigo-50 rounded-xl p-4 mb-4">
            <p className="text-sm text-indigo-600">Total Contributions</p>
            <p className="text-2xl font-bold text-indigo-800">TZS {Number(total).toLocaleString()}</p>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : contributions.length === 0 ? (
            <p className="text-gray-500">No contributions found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Description</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Recorded By</th>
                  </tr>
                </thead>
                <tbody>
                  {contributions.map(c => (
                    <tr key={c.id} className="border-t border-gray-100">
                      <td className="py-3 px-4 text-sm">{c.contribution_date?.split('T')[0]}</td>
                      <td className="py-3 px-4 text-sm font-semibold text-indigo-600">TZS {Number(c.amount).toLocaleString()}</td>
                      <td className="py-3 px-4 text-sm">{c.description || '-'}</td>
                      <td className="py-3 px-4 text-sm">{c.recorder?.name || 'N/A'}</td>
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

export default MemberContributions;
