import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import { FaChartLine, FaUsers, FaDollarSign, FaPlus, FaFileExport } from 'react-icons/fa';

const LeaderDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contributions, setContributions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const menuItems = [
    { icon: FaChartLine, label: 'Dashboard', path: '/leader/dashboard' },
    { icon: FaPlus, label: 'Record Contribution', path: '/leader/record' },
    { icon: FaFileExport, label: 'Faculty Reports', path: '/leader/reports' },
  ];

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    Promise.all([api.get('/contributions'), api.get('/contributions/total')])
      .then(([contribRes, totalRes]) => {
        setContributions(contribRes.data);
        setTotal(totalRes.data.total);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user, navigate]);

  if (!user) return null;
  const memberCount = new Set(contributions.map(c => c.member_id)).size;

  return (
    <Layout menuItems={menuItems}>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white">
          <h1 className="text-2xl font-bold">Welcome, {user.name} 👋</h1>
          <p className="text-blue-100 mt-1">Building Fund Leader Dashboard</p>
          <p className="text-blue-200 text-sm mt-2">Faculty: {user.faculty?.name || 'N/A'}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-gray-500 text-sm font-medium">Total Contributions</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">TZS {Number(total).toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-gray-500 text-sm font-medium">Total Members</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">{memberCount}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-gray-500 text-sm font-medium">Contributions</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">{contributions.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Contributions</h2>
          {loading ? <p>Loading...</p> : contributions.length === 0 ? <p>No contributions yet.</p> : (
            <div className="overflow-x-auto"><table className="w-full"><thead><tr className="bg-gray-50"><th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Member</th><th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Amount</th><th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th><th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Recorded By</th></tr></thead>
            <tbody>{contributions.slice(0,10).map(c => (<tr key={c.id} className="border-t border-gray-100"><td className="py-3 px-4 text-sm">{c.member?.name || 'N/A'}</td><td className="py-3 px-4 text-sm font-semibold text-blue-600">TZS {Number(c.amount).toLocaleString()}</td><td className="py-3 px-4 text-sm">{c.contribution_date?.split('T')[0]}</td><td className="py-3 px-4 text-sm">{c.recorder?.name || 'N/A'}</td></tr>))}</tbody></table></div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LeaderDashboard;
