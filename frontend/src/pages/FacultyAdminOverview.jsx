import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import { FaChartLine, FaUsers, FaDollarSign, FaChurch } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';

const FacultyAdminOverview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contributions, setContributions] = useState([]);
  const [total, setTotal] = useState(0);
  const [facultyTarget, setFacultyTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchData();
  }, [user, navigate, year]);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get('/contributions'),
      api.get('/contributions/total'),
      api.get(`/targets/progress?year=${year}`)
    ])
      .then(([contribRes, totalRes, progressRes]) => {
        setContributions(contribRes.data);
        setTotal(Number(totalRes.data.total) || 0);
        const facultyProgress = progressRes.data.progress?.find(p => p.target.faculty_id === user.faculty_id);
        setFacultyTarget(facultyProgress || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  if (!user) return null;

  const memberIds = new Set(contributions.map(c => c.member_id));
  const memberCount = memberIds.size;
  const targetAmount = facultyTarget?.target?.target_amount || 0;
  const raisedAmount = facultyTarget?.raised || total || 0;
  const percentage = targetAmount > 0 ? (raisedAmount / targetAmount) * 100 : 0;

  // Monthly trend data
  const monthData = contributions.reduce((acc, c) => {
    const month = c.contribution_date?.slice(0,7) || 'unknown';
    acc[month] = (acc[month] || 0) + Number(c.amount);
    return acc;
  }, {});
  const lineChartData = Object.keys(monthData).map(key => ({ month: key, amount: monthData[key] }));

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

  // Pie data for faculty contributions (if multiple faculties, but for faculty admin it's just one faculty)
  const pieData = [{ name: user.faculty?.name || 'Faculty', value: raisedAmount }];

  const COLORS = ['#4f46e5', '#7c3aed', '#2563eb'];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-8 text-white">
          <h1 className="text-2xl font-bold">Faculty Admin Dashboard</h1>
          <p className="text-green-100 mt-1">{user.faculty?.name || 'Your'} Faculty Overview</p>
          <p className="text-green-200 text-sm mt-1">Year: {year}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-gray-500 text-sm font-medium">Faculty Overall Target</h3>
            <p className="text-2xl font-bold text-indigo-600 mt-2">TZS {Number(targetAmount).toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-gray-500 text-sm font-medium">Faculty Total Raised</h3>
            <p className="text-2xl font-bold text-green-600 mt-2">TZS {Number(raisedAmount).toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-gray-500 text-sm font-medium">Total Members</h3>
            <p className="text-2xl font-bold text-gray-800 mt-2">{memberCount}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-gray-500 text-sm font-medium">Contributions</h3>
            <p className="text-2xl font-bold text-gray-800 mt-2">{contributions.length}</p>
          </div>
        </div>

        {targetAmount > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-gray-700 font-medium mb-2">Progress Toward Faculty Target</h3>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">{percentage.toFixed(1)}%</span>
              <span className="text-sm text-gray-600">TZS {Number(raisedAmount).toLocaleString()} / TZS {Number(targetAmount).toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-indigo-600 h-3 rounded-full transition-all duration-500" style={{ width: `${Math.min(percentage, 100)}%` }} />
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Monthly Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={lineChartData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(val) => `TZS ${Number(val).toLocaleString()}`} />
                <Line type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Top 10 Contributors</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topContributors}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(val) => `TZS ${Number(val).toLocaleString()}`} />
                <Bar dataKey="amount" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FacultyAdminOverview;
