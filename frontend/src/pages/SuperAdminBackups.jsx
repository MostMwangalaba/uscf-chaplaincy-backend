import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import { FaChartLine, FaUsers, FaDollarSign, FaDatabase, FaBullhorn, FaCog, FaUserFriends, FaDownload, FaTrash, FaPlus } from 'react-icons/fa';

const SuperAdminBackups = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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
    fetchBackups();
  }, [user, navigate]);

  const fetchBackups = () => {
    setLoading(true);
    api.get('/backups')
      .then(res => {
        setBackups(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const createBackup = async () => {
    setMessage(''); setError('');
    try {
      const res = await api.post('/backups');
      setMessage(`Backup created: ${res.data.filename}`);
      fetchBackups();
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      setError('Failed to create backup');
    }
  };

  const downloadBackup = async (filename) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:8000/api/backups/${filename}/download`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    alert('Error downloading backup');
  }
};
  const deleteBackup = async (filename) => {
    if (!window.confirm('Delete this backup?')) return;
    try {
      await api.delete(`/backups/${filename}`);
      fetchBackups();
    } catch (err) {
      alert('Error deleting backup');
    }
  };

  if (!user) return null;

  return (
    <Layout menuItems={menuItems}>
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <FaDatabase className="mr-2 text-indigo-600" />
            System Backups
          </h2>

          <button onClick={createBackup} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 mb-4 flex items-center gap-2">
            <FaPlus /> Create Backup
          </button>

          {message && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4">{message}</div>}
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">{error}</div>}

          {loading ? <p>Loading...</p> : backups.length === 0 ? <p>No backups found.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="bg-gray-50"><th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Filename</th><th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Size</th><th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Created</th><th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th></tr></thead>
                <tbody>
                  {backups.map(b => (
                    <tr key={b.id} className="border-t border-gray-100">
                      <td className="py-3 px-4 text-sm">{b.filename}</td>
                      <td className="py-3 px-4 text-sm">{(b.size / 1024).toFixed(2)} KB</td>
                      <td className="py-3 px-4 text-sm">{new Date(b.created_at * 1000).toLocaleString()}</td>
                      <td className="py-3 px-4 flex gap-2">
                        <button onClick={() => downloadBackup(b.id)} className="text-blue-600 hover:text-blue-800"><FaDownload /></button>
                        <button onClick={() => deleteBackup(b.id)} className="text-red-600 hover:text-red-800"><FaTrash /></button>
                      </td>
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

export default SuperAdminBackups;
