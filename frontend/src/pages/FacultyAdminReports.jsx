import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';

const FacultyAdminReports = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contributions, setContributions] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    Promise.all([
      api.get('/contributions'),
      api.get('/users')
    ])
      .then(([contribRes, usersRes]) => {
        setContributions(contribRes.data);
        const facultyMembers = usersRes.data.filter(u => u.role === 'member' && u.faculty_id === user.faculty_id);
        setMembers(facultyMembers);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user, navigate]);

  if (loading) return <Layout><div>Loading...</div></Layout>;

  const memberTotals = members.map(m => {
    const total = contributions
      .filter(c => c.member_id === m.id)
      .reduce((sum, c) => sum + Number(c.amount), 0);
    return { ...m, total };
  });

  const totalRaised = memberTotals.reduce((sum, m) => sum + m.total, 0);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Faculty Summary Report</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-indigo-50 rounded-xl p-4">
              <p className="text-sm text-indigo-600">Total Members</p>
              <p className="text-2xl font-bold text-indigo-800">{members.length}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-sm text-green-600">Total Contributions</p>
              <p className="text-2xl font-bold text-green-800">{contributions.length}</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <p className="text-sm text-purple-600">Total Raised</p>
              <p className="text-2xl font-bold text-purple-800">TZS {Number(totalRaised).toLocaleString()}</p>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Member-wise Totals</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Member ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Total</th>
                </tr>
              </thead>
              <tbody>
                {memberTotals.map(m => (
                  <tr key={m.id} className="border-t border-gray-100">
                    <td className="py-3 px-4">{m.name}</td>
                    <td className="py-3 px-4 font-mono">{m.member_id}</td>
                    <td className="py-3 px-4 font-semibold text-indigo-600">TZS {Number(m.total).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FacultyAdminReports;
