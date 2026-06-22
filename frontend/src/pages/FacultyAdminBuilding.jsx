import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';

const FacultyAdminBuilding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/contributions')
      .then(res => { setContributions(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user, navigate]);

  if (!user) return null;

  // Monthly data
  const monthData = contributions.reduce((acc, c) => {
    const month = c.contribution_date?.slice(0,7) || 'unknown';
    acc[month] = (acc[month] || 0) + Number(c.amount);
    return acc;
  }, {});
  const barChartData = Object.keys(monthData).map(key => ({ month: key, amount: monthData[key] }));

  // Top contributors
  const memberTotals = contributions.reduce((acc, c) => {
    const name = c.member?.name || 'Unknown';
    acc[name] = (acc[name] || 0) + Number(c.amount);
    return acc;
  }, {});
  const topContributors = Object.keys(memberTotals)
    .map(name => ({ name, amount: memberTotals[name] }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);

  // Pie chart (faculty contribution breakdown – just one faculty for faculty admin)
  const pieData = [{ name: user.faculty?.name || 'Faculty', value: contributions.reduce((sum, c) => sum + Number(c.amount), 0) }];

  const COLORS = ['#4f46e5', '#7c3aed', '#10b981'];

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Building Fund Analytics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Monthly Contributions</h3>
            {loading ? <p>Loading...</p> : barChartData.length === 0 ? <p>No data to display.</p> : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barChartData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(val) => `TZS ${Number(val).toLocaleString()}`} />
                  <Bar dataKey="amount" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Top 10 Contributors</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topContributors}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(val) => `TZS ${Number(val).toLocaleString()}`} />
                <Bar dataKey="amount" fill="#7c3aed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Contribution Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(val) => `TZS ${Number(val).toLocaleString()}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Layout>
  );
};

export default FacultyAdminBuilding;
