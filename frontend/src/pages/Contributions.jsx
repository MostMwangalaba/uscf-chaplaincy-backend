import React from 'react';
import Layout from '../components/Layout';

const Contributions = () => (
  <Layout>
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold text-gray-800">My Contributions</h2>
      <p className="text-gray-600 mt-2">Full table of all your Building Fund contributions will appear here.</p>
      <div className="mt-4 p-8 bg-gray-50 rounded-lg text-center text-gray-400">
        <span className="text-2xl">📊</span>
        <p className="mt-2">Contribution history coming soon</p>
      </div>
    </div>
  </Layout>
);
export default Contributions;
