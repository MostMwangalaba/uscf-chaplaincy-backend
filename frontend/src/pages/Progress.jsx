import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const Progress = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get(`/targets/progress?year=${year}`)
      .then(res => {
        setProgress(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user, navigate, year]);

  if (!user) return null;

  const overall = progress?.overall;
  const facultyProgress = progress?.progress?.find(p => p.target.faculty_id === user.faculty_id);
  const facultyTarget = facultyProgress?.target?.target_amount || 0;
  const facultyRaised = facultyProgress?.raised || 0;
  const facultyPercentage = facultyProgress?.percentage || 0;

  // Prepare chart data
  const chartData = progress?.progress?.map(p => ({
    name: p.target.faculty?.name || 'Overall',
    target: Number(p.target.target_amount),
    raised: Number(p.raised),
    percentage: Number(p.percentage),
  })) || [];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Building Progress</h2>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-1"
          >
            {[2024, 2025, 2026, 2027, 2028].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : !progress ? (
          <p className="text-gray-500">No progress data available.</p>
        ) : (
          <div className="space-y-6">
            {/* Overall Progress */}
            {overall && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-700">Overall UDOM Progress</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-600">Target: TZS {Number(overall.target).toLocaleString()}</span>
                  <span className="text-sm text-gray-600">Raised: TZS {Number(overall.raised).toLocaleString()}</span>
                  <span className="text-sm font-bold text-indigo-600">{overall.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
                  <div className="bg-indigo-600 h-4 rounded-full" style={{ width: `${Math.min(overall.percentage, 100)}%` }} />
                </div>
              </div>
            )}

            {/* Faculty Progress */}
            {facultyTarget > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-700">Your Faculty: {user.faculty?.name}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-600">Target: TZS {Number(facultyTarget).toLocaleString()}</span>
                  <span className="text-sm text-gray-600">Raised: TZS {Number(facultyRaised).toLocaleString()}</span>
                  <span className="text-sm font-bold text-green-600">{facultyPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
                  <div className="bg-green-600 h-4 rounded-full" style={{ width: `${Math.min(facultyPercentage, 100)}%` }} />
                </div>
              </div>
            )}

            {/* Chart */}
            {chartData.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Faculty Comparison</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(val) => `TZS ${Number(val).toLocaleString()}`} />
                    <Bar dataKey="raised" fill="#4f46e5" name="Raised" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Progress;
