import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import { FaChartLine, FaUsers, FaDollarSign, FaDatabase, FaBullhorn, FaCog, FaUserFriends, FaFilter } from 'react-icons/fa';

const SuperAdminAudit = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ action: '', from_date: '', to_date: '' });
  const [pagination, setPagination] = useState(null);

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
    fetchLogs();
    fetchActions();
  }, [user, navigate]);

  const fetchLogs = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.action) params.append('action', filters.action);
    if (filters.from_date) params.append('from_date', filters.from_date);
    if (filters.to_date) params.append('to_date', filters.to_date);
    api.get(`/audit-logs?${params.toString()}`)
      .then(res => {
        setLogs(res.data.logs.data);
        setPagination(res.data.logs);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const fetchActions = () => {
    api.get('/audit-logs/actions')
      .then(res => setActions(res.data))
      .catch(() => {});
  };

  const applyFilters = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  if (!user) return null;

  return (
    <Layout menuItems={menuItems}>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <FaCog className="mr-2 text-indigo-600" />
          Audit Logs
        </h2>

        <form onSubmit={applyFilters} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-gray-50 p-4 rounded-xl">
          <select value={filters.action} onChange={(e) => setFilters({ ...filters, action: e.target.value })} className="border border-gray-300 rounded-lg px-4 py-2">
            <option value="">All Actions</option>
            {actions.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <input type="date" placeholder="From" value={filters.from_date} onChange={(e) => setFilters({ ...filters, from_date: e.target.value })} className="border border-gray-300 rounded-lg px-4 py-2" />
          <input type="date" placeholder="To" value={filters.to_date} onChange={(e) => setFilters({ ...filters, to_date: e.target.value })} className="border border-gray-300 rounded-lg px-4 py-2" />
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"><FaFilter /> Apply Filters</button>
        </form>

        {loading ? <p>Loading...</p> : logs.length === 0 ? <p>No logs found.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="bg-gray-50"><th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">User</th><th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Action</th><th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Model</th><th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">IP</th><th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Time</th></tr></thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="border-t border-gray-100">
                    <td className="py-3 px-4 text-sm">{log.user?.name || 'Unknown'}</td>
                    <td className="py-3 px-4 text-sm"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">{log.action}</span></td>
                    <td className="py-3 px-4 text-sm">{log.model_type}</td>
                    <td className="py-3 px-4 text-sm">{log.ip_address || '-'}</td>
                    <td className="py-3 px-4 text-sm">{new Date(log.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pagination && (
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-gray-500">Page {pagination.current_page} of {pagination.last_page}</span>
                <div className="flex gap-2">
                  {pagination.prev_page_url && <button onClick={() => { /* navigate to prev page */ }} className="px-3 py-1 border rounded hover:bg-gray-50">Prev</button>}
                  {pagination.next_page_url && <button onClick={() => { /* navigate to next page */ }} className="px-3 py-1 border rounded hover:bg-gray-50">Next</button>}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SuperAdminAudit;
