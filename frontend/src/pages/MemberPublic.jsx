import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';

const MemberPublic = () => {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/public/member/${id}`)
      .then(res => {
        setMember(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Member not found');
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (error) return <div className="flex items-center justify-center min-h-screen text-red-600">{error}</div>;
  if (!member) return <div className="flex items-center justify-center min-h-screen">Member not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl max-w-2xl w-full p-8 text-center border border-white/50">
        <div className="mb-4">
          <img src="/logo.png" alt="USCF Logo" className="h-16 w-auto mx-auto" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">{member.name}</h1>
        <p className="text-gray-600">{member.faculty}</p>
        <div className="mt-4 bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
          <p className="text-sm text-gray-500">Total Contributions</p>
          <p className="text-2xl font-bold text-indigo-600">TZS {Number(member.total).toLocaleString()}</p>
        </div>
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Contribution History</h3>
          {member.contributions.length === 0 ? (
            <p className="text-gray-500">No contributions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-3 text-left font-semibold text-gray-600">Date</th>
                    <th className="py-2 px-3 text-left font-semibold text-gray-600">Amount</th>
                    <th className="py-2 px-3 text-left font-semibold text-gray-600">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {member.contributions.map((c, idx) => (
                    <tr key={idx} className="border-t border-gray-200">
                      <td className="py-2 px-3">{c.date}</td>
                      <td className="py-2 px-3 font-semibold text-indigo-600">TZS {Number(c.amount).toLocaleString()}</td>
                      <td className="py-2 px-3">{c.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <p className="mt-6 text-xs text-gray-400">This is a public profile showing all contributions.</p>
      </div>
    </div>
  );
};

export default MemberPublic;
