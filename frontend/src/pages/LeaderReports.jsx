import React from 'react';
import Layout from '../components/Layout';
import { FaChartLine, FaPlus, FaDollarSign, FaFileExport } from 'react-icons/fa';

const LeaderReports = () => {
  const menuItems = [
    { icon: FaChartLine, label: 'Dashboard', path: '/leader/dashboard' },
    { icon: FaPlus, label: 'Record Contribution', path: '/leader/record' },
    { icon: FaDollarSign, label: 'Faculty Reports', path: '/leader/reports' },
  ];

  return (
    <Layout menuItems={menuItems}>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <FaFileExport className="mr-3 text-indigo-600" />
          Faculty Reports
        </h2>
        <p className="text-gray-600">Export reports for your faculty:</p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-2 p-4 border border-gray-200 rounded-xl hover:bg-gray-50">
            📊 Member-wise Totals
          </button>
          <button className="flex items-center justify-center gap-2 p-4 border border-gray-200 rounded-xl hover:bg-gray-50">
            📈 Monthly Summaries
          </button>
          <button className="flex items-center justify-center gap-2 p-4 border border-gray-200 rounded-xl hover:bg-gray-50">
            📅 Yearly Report
          </button>
          <button className="flex items-center justify-center gap-2 p-4 border border-gray-200 rounded-xl hover:bg-gray-50">
            📋 Export PDF
          </button>
        </div>
        <p className="text-sm text-gray-400 mt-4">Full report generation coming soon...</p>
      </div>
    </Layout>
  );
};

export default LeaderReports;
