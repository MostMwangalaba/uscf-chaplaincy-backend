import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Statement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/contributions')
      .then(res => {
        setContributions(res.data);
        const sum = res.data.reduce((acc, c) => acc + Number(c.amount), 0);
        setTotal(sum);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user, navigate]);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('USCF Chaplaincy - Building Fund Statement', 14, 22);
    doc.setFontSize(12);
    doc.text(`Member: ${user.name} (${user.member_id})`, 14, 32);
    doc.text(`Faculty: ${user.faculty?.name || 'N/A'}`, 14, 40);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 48);

    const tableData = contributions.map(c => [
      c.contribution_date?.split('T')[0] || 'N/A',
      `TZS ${Number(c.amount).toLocaleString()}`,
      c.description || '-',
      c.recorder?.name || 'N/A'
    ]);

    doc.autoTable({
      startY: 55,
      head: [['Date', 'Amount', 'Description', 'Recorded By']],
      body: tableData,
      foot: [['', 'Total', `TZS ${Number(total).toLocaleString()}`, '']],
    });

    doc.save(`statement_${user.member_id}_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Building Fund Statement</h2>
        <p className="text-gray-600 mb-4">Generate a PDF statement of all your contributions.</p>
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <p className="text-sm text-gray-600">Total Contributions</p>
          <p className="text-2xl font-bold text-indigo-600">TZS {Number(total).toLocaleString()}</p>
          <p className="text-sm text-gray-500">{contributions.length} contributions</p>
        </div>
        <button
          onClick={generatePDF}
          disabled={loading || contributions.length === 0}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          📄 Download PDF Statement
        </button>
        {contributions.length === 0 && !loading && (
          <p className="text-sm text-gray-500 mt-2">No contributions to generate statement.</p>
        )}
      </div>
    </Layout>
  );
};

export default Statement;
