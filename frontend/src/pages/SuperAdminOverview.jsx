import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import { 
  FaChartLine, FaUsers, FaDollarSign, FaDatabase, FaBullhorn, FaCog, FaUserFriends,
  FaUniversity, FaUserTie, FaMoneyBillWave, FaBuilding
} from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const SuperAdminOverview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalFacultyAdmins: 0,
    totalSuperAdmins: 0,
    totalUsers: 0,
    totalContributions: 0,
    totalFaculties: 0,
    overallTarget: 0,
    overallRaised: 0,
    overallPercentage: 0,
  });
  const [facultyData, setFacultyData] = useState([]);
  const [facultyContributions, setFacultyContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchData();
  }, [user, navigate, year]);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get('/users'),
      api.get('/contributions/total'),
      api.get(`/targets/progress?year=${year}`),
      api.get('/faculties'),
      api.get('/contributions')
    ])
      .then(([usersRes, totalRes, progressRes, facultiesRes, contribRes]) => {
        console.log('Users response:', usersRes.data);
        console.log('Total response:', totalRes.data);
        console.log('Progress response:', progressRes.data);
        console.log('Faculties response:', facultiesRes.data);
        console.log('Contributions response:', contribRes.data);

        const users = usersRes.data || [];
        const members = users.filter(u => u.role === 'member');
        const facultyAdmins = users.filter(u => u.role === 'faculty_admin');
        const superAdmins = users.filter(u => u.role === 'super_admin');

        const faculties = facultiesRes.data || [];
        const totalFaculties = faculties.length;

        const totalContributions = Number(totalRes.data?.total) || 0;

        const overall = progressRes.data?.overall || {};
        const overallTarget = overall.target || 0;
        const overallRaised = overall.raised || 0;
        const overallPercentage = overallTarget > 0 ? (overallRaised / overallTarget) * 100 : 0;

        // Per-faculty contribution
        const contribs = contribRes.data || [];
        const facultyTotals = faculties.map(f => {
          const total = contribs
            .filter(c => c.faculty_id === f.id)
            .reduce((sum, c) => sum + Number(c.amount), 0);
          return { name: f.name, raised: total };
        });

        setFacultyContributions(facultyTotals);

        setStats({
          totalMembers: members.length,
          totalFacultyAdmins: facultyAdmins.length,
          totalSuperAdmins: superAdmins.length,
          totalUsers: users.length,
          totalContributions,
          totalFaculties,
          overallTarget,
          overallRaised,
          overallPercentage,
        });

        setFacultyData(faculties.map(f => ({ name: f.name, members: users.filter(u => u.faculty_id === f.id && u.role === 'member').length })));
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching data:', err);
        setLoading(false);
      });
  };

  if (loading) return <Layout><div className="p-8 text-center">Loading...</div></Layout>;

  const COLORS = ['#4f46e5', '#7c3aed', '#2563eb', '#0891b2', '#059669', '#d97706'];

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">System Overview</h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-500 text-sm font-medium">Total Members</h3>
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <FaUsers className="text-indigo-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalMembers}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-500 text-sm font-medium">Faculty Admins</h3>
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <FaUserTie className="text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalFacultyAdmins}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-500 text-sm font-medium">Super Admins</h3>
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <FaUserFriends className="text-purple-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalSuperAdmins}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <FaDatabase className="text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalUsers}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-500 text-sm font-medium">Total Contributions</h3>
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <FaMoneyBillWave className="text-yellow-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800 mt-2">TZS {Number(stats.totalContributions).toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-500 text-sm font-medium">Faculties</h3>
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <FaBuilding className="text-red-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalFaculties}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 col-span-2">
            <h3 className="text-gray-500 text-sm font-medium">UDOM Overall Target</h3>
            <p className="text-2xl font-bold text-indigo-600 mt-2">TZS {Number(stats.overallTarget).toLocaleString()}</p>
            <p className="text-sm text-gray-500">Raised: TZS {Number(stats.overallRaised).toLocaleString()} ({stats.overallPercentage.toFixed(1)}%)</p>
            <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
              <div className="bg-indigo-600 h-3 rounded-full transition-all duration-500" style={{ width: `${Math.min(stats.overallPercentage, 100)}%` }} />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Members per Faculty</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={facultyData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="members" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Contributions per Faculty</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={facultyContributions}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(val) => `TZS ${Number(val).toLocaleString()}`} />
                <Bar dataKey="raised" fill="#7c3aed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SuperAdminOverview;
