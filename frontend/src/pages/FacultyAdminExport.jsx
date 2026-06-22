import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';

const FacultyAdminExport = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchData();
  }, [user, navigate]);

  const fetchData = () => {
    setLoading(true);
    api.get('/contributions')
      .then(res => {
        setContributions(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const exportCSV = () => {
    const filtered = contributions.filter(c => {
      if (startDate && new Date(c.contribution_date) < new Date(startDate)) return false;
      if (endDate && new Date(c.contribution_date) > new Date(endDate)) return false;
      return true;
    });

    if (filtered.length === 0) {
      alert('No data to export in the selected date range.');
      return;
    }

    const headers = ['Member Name', 'Member ID', 'Amount', 'Date', 'Recorded By', 'Description'];
    const rows = filtered.map(c => [
      c.member?.name || 'N/A',
      c.member?.member_id || 'N/A',
      c.amount,
      c.contribution_date?.split('T')[0],
      c.recorder?.name || 'N/A',
      c.description || '',
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `faculty_contributions_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Export Reports</h2>
        <p className="text-gray-600 mb-4">Export faculty data in CSV format.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={exportCSV}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
            >
              📥 Export CSV
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-400 mt-4">
          {contributions.length} contributions found. Use date filters to narrow down.
        </p>
      </div>
    </Layout>
  );
};

export default FacultyAdminExport;
