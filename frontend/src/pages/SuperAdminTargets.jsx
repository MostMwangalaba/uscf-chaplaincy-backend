import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import { 
  FaChartLine, FaUsers, FaDollarSign, FaDatabase, FaBullhorn, FaCog, FaUserFriends,
  FaPlus, FaTrash, FaEdit, FaBullseye
} from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const SuperAdminTargets = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [targets, setTargets] = useState([]);
  const [progress, setProgress] = useState(null);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    year: new Date().getFullYear(),
    faculty_id: '',
    target_amount: '',
    target_type: 'overall',
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const menuItems = [
    { icon: FaChartLine, label: 'Overview', path: '/super-admin/overview' },
    { icon: FaUserFriends, label: 'Members', path: '/super-admin/members' },
    { icon: FaUsers, label: 'User Management', path: '/super-admin/users' },
    { icon: FaDollarSign, label: 'Targets & Goals', path: '/super-admin/targets' },
    { icon: FaDatabase, label: 'Backups', path: '/super-admin/backups' },
    { icon: FaCog, label: 'Audit Logs', path: '/super-admin/audit' },
    { icon: FaBullhorn, label: 'Broadcast', path: '/super-admin/broadcast' },
  ];

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchData();
  }, [user, navigate, selectedYear]);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get('/targets'),
      api.get(`/targets/progress?year=${selectedYear}`),
      api.get('/faculties')
    ])
      .then(([targetsRes, progressRes, facultiesRes]) => {
        setTargets(targetsRes.data);
        setProgress(progressRes.data);
        setFaculties(facultiesRes.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    try {
      const payload = {
        year: form.year,
        target_amount: form.target_amount,
        faculty_id: form.target_type === 'overall' ? null : form.faculty_id,
      };
      if (editingId) {
        await api.put(`/targets/${editingId}`, payload);
        setMessage('Target updated successfully');
      } else {
        await api.post('/targets', payload);
        setMessage('Target created successfully');
      }
      setForm({ year: new Date().getFullYear(), faculty_id: '', target_amount: '', target_type: 'overall' });
      setEditingId(null);
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving target');
    }
  };

  const deleteTarget = async (id) => {
    if (!window.confirm('Delete this target?')) return;
    try {
      await api.delete(`/targets/${id}`);
      fetchData();
    } catch (err) {
      alert('Error deleting target');
    }
  };

  const editTarget = (target) => {
    setForm({
      year: target.year,
      faculty_id: target.faculty_id || '',
      target_amount: target.target_amount,
      target_type: target.faculty_id ? 'faculty' : 'overall',
    });
    setEditingId(target.id);
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let y = currentYear - 5; y <= currentYear + 5; y++) {
    yearOptions.push(y);
  }

  // Prepare data for charts
  const barChartData = progress?.progress?.map(p => ({
    name: p.target.faculty?.name || 'Faculty',
    target: Number(p.target.target_amount),
    raised: Number(p.raised),
  })) || [];

  const pieData = progress?.progress?.map(p => ({
    name: p.target.faculty?.name || 'Faculty',
    value: Number(p.raised),
  })) || [];

  const COLORS = ['#4f46e5', '#7c3aed', '#2563eb', '#0891b2', '#059669', '#d97706'];

  if (!user) return null;

  return (
    <Layout menuItems={menuItems}>
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <FaBullseye className="mr-2 text-indigo-600" />
              Targets & Goals
            </h2>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Year:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
              >
                {yearOptions.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {progress && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-indigo-50 rounded-xl p-4">
                <p className="text-sm text-indigo-600">Overall Target ({progress.year})</p>
                <p className="text-xl font-bold text-indigo-800">TZS {Number(progress.overall.target).toLocaleString()}</p>
                <p className="text-sm">Raised: TZS {Number(progress.overall.raised).toLocaleString()} ({progress.overall.percentage}%)</p>
                <div className="w-full bg-indigo-200 rounded-full h-2 mt-1">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${Math.min(progress.overall.percentage, 100)}%` }} />
                </div>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-sm text-green-600">Faculty Targets Count</p>
                <p className="text-xl font-bold text-green-800">{targets.filter(t => t.faculty_id !== null).length}</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <p className="text-sm text-purple-600">Total Raised (All)</p>
                <p className="text-xl font-bold text-purple-800">TZS {Number(progress?.overall?.raised || 0).toLocaleString()}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-gray-50 p-4 rounded-xl">
            <select
              value={form.year}
              onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
              required
            >
              {yearOptions.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <select
              value={form.target_type}
              onChange={(e) => {
                const val = e.target.value;
                setForm({ ...form, target_type: val, faculty_id: val === 'overall' ? '' : form.faculty_id });
              }}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="overall">Overall Target</option>
              <option value="faculty">Faculty Specific</option>
            </select>
            {form.target_type === 'faculty' && (
              <select
                value={form.faculty_id}
                onChange={(e) => setForm({ ...form, faculty_id: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Select Faculty</option>
                {faculties.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            )}
            <input
              type="number"
              placeholder="Target Amount (TZS)"
              value={form.target_amount}
              onChange={(e) => setForm({ ...form, target_amount: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
              required
            />
            <div className="md:col-span-4">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
              >
                <FaPlus /> {editingId ? 'Update Target' : 'Create Target'}
              </button>
            </div>
          </form>

          {message && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4">{message}</div>}
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">{error}</div>}

          {loading ? <p>Loading...</p> : targets.length === 0 ? <p>No targets set for this year.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="bg-gray-50"><th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Year</th><th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Faculty</th><th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Target</th><th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Raised</th><th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">%</th><th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th></tr></thead>
                <tbody>
                  {targets.map(t => {
                    const prog = progress?.progress?.find(p => p.target.id === t.id);
                    return (
                      <tr key={t.id} className="border-t border-gray-100">
                        <td className="py-3 px-4">{t.year}</td>
                        <td className="py-3 px-4">{t.faculty?.name || 'Overall'}</td>
                        <td className="py-3 px-4 font-semibold">TZS {Number(t.target_amount).toLocaleString()}</td>
                        <td className="py-3 px-4">TZS {Number(prog?.raised || 0).toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                            {prog?.percentage || 0}%
                          </span>
                        </td>
                        <td className="py-3 px-4 flex gap-2">
                          <button onClick={() => editTarget(t)} className="text-blue-600 hover:text-blue-800"><FaEdit /></button>
                          <button onClick={() => deleteTarget(t.id)} className="text-red-600 hover:text-red-800"><FaTrash /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Charts Section */}
        {barChartData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Target vs Raised per Faculty</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(val) => `TZS ${Number(val).toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="target" fill="#4f46e5" name="Target" />
                  <Bar dataKey="raised" fill="#10b981" name="Raised" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Raised Contributions Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => `TZS ${Number(val).toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SuperAdminTargets;
