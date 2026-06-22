import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import { FaChartLine, FaHistory, FaChurch, FaBullseye } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const MemberDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contributions, setContributions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [overallTarget, setOverallTarget] = useState(0);
  const [overallRaised, setOverallRaised] = useState(0);
  const [facultyTarget, setFacultyTarget] = useState(0);
  const [facultyRaised, setFacultyRaised] = useState(0);
  const [memberTarget, setMemberTarget] = useState(0);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchData();
  }, [user, navigate]);

  const fetchData = () => {
    const year = new Date().getFullYear();
    Promise.all([
      api.get('/contributions'),
      api.get('/contributions/total'),
      api.get(`/targets/progress?year=${year}`).catch(() => ({ data: { overall: { target: 0, raised: 0 }, progress: [] } })),
      api.get(`/member-targets?year=${year}`).catch(() => ({ data: null }))
    ])
      .then(([contribRes, totalRes, progressRes, memberTargetRes]) => {
        const contribs = contribRes.data || [];
        setContributions(contribs);
        setTotal(Number(totalRes.data.total) || 0);

        const overall = progressRes.data?.overall || { target: 0, raised: 0 };
        setOverallTarget(overall.target || 0);
        setOverallRaised(overall.raised || 0);

        // Find faculty progress
        const facultyProg = progressRes.data?.progress?.find(p => p.target?.faculty_id === user.faculty_id);
        if (facultyProg) {
          setFacultyTarget(Number(facultyProg.target?.target_amount) || 0);
          setFacultyRaised(Number(facultyProg.raised) || 0);
        } else {
          setFacultyTarget(0);
          setFacultyRaised(0);
        }

        if (memberTargetRes.data) {
          setMemberTarget(Number(memberTargetRes.data.target_amount) || 0);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching data:', err);
        setLoading(false);
      });
  };

  if (!user) return null;

  // Prepare chart data
  const monthData = contributions.reduce((acc, c) => {
    if (c.contribution_date) {
      const month = c.contribution_date.slice(0,7);
      acc[month] = (acc[month] || 0) + Number(c.amount);
    }
    return acc;
  }, {});
  const chartData = Object.keys(monthData).map(key => ({ month: key, amount: monthData[key] }));
  chartData.sort((a, b) => a.month.localeCompare(b.month));

  let cumSum = 0;
  const cumulativeData = chartData.map(item => {
    cumSum += item.amount;
    return { month: item.month, cumulative: cumSum };
  });

  const hasContributions = contributions.length > 0;

  const facultyPercentage = facultyTarget > 0 ? (facultyRaised / facultyTarget) * 100 : 0;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
          <h1 className="text-2xl font-bold">Welcome back, {user.name} 👋</h1>
          <p className="text-indigo-100 mt-1">Here's your contribution summary</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-500 text-sm font-medium">UDOM Overall Target</h3>
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <FaBullseye className="text-indigo-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800 mt-2">TZS {Number(overallTarget).toLocaleString()}</p>
            <p className="text-xs text-gray-500">Raised: TZS {Number(overallRaised).toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-500 text-sm font-medium">Your Faculty Target</h3>
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <FaChurch className="text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800 mt-2">TZS {Number(facultyTarget).toLocaleString()}</p>
            <p className="text-xs text-gray-500">Raised: TZS {Number(facultyRaised).toLocaleString()}</p>
            {facultyTarget > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                <div className="bg-green-600 h-1.5 rounded-full" style={{ width: `${Math.min(facultyPercentage, 100)}%` }} />
              </div>
            )}
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-500 text-sm font-medium">Your Member Target</h3>
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <FaBullseye className="text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800 mt-2">
              {memberTarget > 0 ? `TZS ${Number(memberTarget).toLocaleString()}` : 'Not Set'}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-500 text-sm font-medium">Your Contribution</h3>
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <FaHistory className="text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800 mt-2">TZS {Number(total).toLocaleString()}</p>
          </div>
        </div>

        {/* Recent Contributions Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <FaHistory className="mr-2 text-indigo-600" />
            Recent Contributions
          </h2>
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
                  {contributions.slice(0, 10).map((c, i) => (
                    <tr key={c.id} className={`border-t border-gray-100 ${i % 2 === 0 ? 'bg-gray-50/50' : ''}`}>
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

        {/* Charts Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Contribution Analytics</h2>
          {!hasContributions ? (
            <p className="text-gray-500 text-center py-8">You have no contributions yet to display charts.</p>
          ) : chartData.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No monthly data to display.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Monthly Contributions</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(val) => `TZS ${Number(val).toLocaleString()}`} />
                    <Bar dataKey="amount" fill="#4f46e5" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Cumulative Contributions</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={cumulativeData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(val) => `TZS ${Number(val).toLocaleString()}`} />
                    <Line type="monotone" dataKey="cumulative" stroke="#7c3aed" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MemberDashboard;
