import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import { FaUserFriends, FaPlus, FaDollarSign, FaEdit, FaTrash, FaTimes, FaEye } from 'react-icons/fa';

const FacultyAdminMembers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showContributionsModal, setShowContributionsModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedContribution, setSelectedContribution] = useState(null);
  const [memberContributions, setMemberContributions] = useState([]);
  const [form, setForm] = useState({
    amount: '',
    contribution_date: new Date().toISOString().split('T')[0],
    description: '',
  });
  const [editForm, setEditForm] = useState({
    amount: '',
    contribution_date: '',
    description: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [facultyTarget, setFacultyTarget] = useState(null);
  const [memberTarget, setMemberTarget] = useState(null);
  const [totalRaised, setTotalRaised] = useState(0);
  const [targetForm, setTargetForm] = useState({
    target_amount: '',
    year: new Date().getFullYear(),
  });
  const [targetMessage, setTargetMessage] = useState('');
  const [targetError, setTargetError] = useState('');
  const [showTargetModal, setShowTargetModal] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchAllData();
  }, [user, navigate]);

  const fetchAllData = async () => {
    setLoading(true);
    const year = new Date().getFullYear();
    try {
      const [usersRes, progressRes, memberTargetRes, totalRes] = await Promise.all([
        api.get('/users'),
        api.get(`/targets/progress?year=${year}`),
        api.get(`/member-targets?year=${year}`),
        api.get('/contributions/total')
      ]);
      // Filter only members of this faculty
      const memberList = usersRes.data.filter(u => u.role === 'member' && u.faculty_id === user.faculty_id);
      console.log('Members for faculty:', memberList);
      setMembers(memberList);
      const facultyProgress = progressRes.data.progress?.find(p => p.target?.faculty_id === user.faculty_id);
      setFacultyTarget(facultyProgress || null);
      setMemberTarget(memberTargetRes.data || null);
      if (memberTargetRes.data) {
        setTargetForm({
          target_amount: memberTargetRes.data.target_amount,
          year: memberTargetRes.data.year,
        });
      } else {
        setTargetForm({
          target_amount: '',
          year: year,
        });
      }
      setTotalRaised(Number(totalRes.data.total) || 0);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = (member) => {
    setSelectedMember(member);
    setShowAddModal(true);
    setForm({ amount: '', contribution_date: new Date().toISOString().split('T')[0], description: '' });
    setMessage('');
    setError('');
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setSelectedMember(null);
  };

  const openContributionsModal = async (member) => {
    setSelectedMember(member);
    setShowContributionsModal(true);
    try {
      const res = await api.get('/contributions');
      const contribs = res.data.filter(c => c.member_id === member.id);
      setMemberContributions(contribs);
    } catch (err) {
      setMemberContributions([]);
    }
    setMessage('');
    setError('');
  };

  const closeContributionsModal = () => {
    setShowContributionsModal(false);
    setSelectedMember(null);
    setMemberContributions([]);
  };

  const openEditModal = (contribution) => {
    setSelectedContribution(contribution);
    setEditForm({
      amount: contribution.amount,
      contribution_date: contribution.contribution_date?.split('T')[0] || '',
      description: contribution.description || '',
    });
    setShowEditModal(true);
    setMessage('');
    setError('');
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedContribution(null);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const data = {
        member_id: selectedMember.id,
        amount: form.amount,
        contribution_date: form.contribution_date,
        description: form.description || 'Building Fund',
      };
      await api.post('/contributions', data);
      setMessage('Contribution added successfully!');
      await fetchAllData();
      closeAddModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding contribution');
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await api.put(`/contributions/${selectedContribution.id}`, editForm);
      setMessage('Contribution updated successfully!');
      fetchAllData().catch(() => {});
      api.get('/contributions')
        .then(res => {
          const contribs = res.data.filter(c => c.member_id === selectedMember.id);
          setMemberContributions(contribs);
        })
        .catch(() => {});
      setTimeout(() => closeEditModal(), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating contribution');
    }
  };

  const deleteContribution = async (id) => {
    if (!window.confirm('Delete this contribution?')) return;
    try {
      await api.delete(`/contributions/${id}`);
      await fetchAllData();
      const res = await api.get('/contributions');
      const contribs = res.data.filter(c => c.member_id === selectedMember.id);
      setMemberContributions(contribs);
    } catch (err) {
      alert('Error deleting contribution');
    }
  };

  const handleTargetSubmit = async (e) => {
    e.preventDefault();
    setTargetMessage('');
    setTargetError('');
    try {
      const payload = {
        faculty_id: user.faculty_id,
        year: targetForm.year,
        target_amount: targetForm.target_amount,
      };
      await api.post('/member-targets', payload);
      setTargetMessage('Member target saved successfully!');
      await fetchAllData();
      setTimeout(() => closeTargetModal(), 1500);
    } catch (err) {
      setTargetError(err.response?.data?.message || 'Error saving target');
    }
  };

  const openTargetModal = () => {
    setShowTargetModal(true);
    setTargetMessage('');
    setTargetError('');
  };

  const closeTargetModal = () => {
    setShowTargetModal(false);
  };

  if (!user) return null;

  const targetAmount = facultyTarget?.target?.target_amount || 0;
  const raisedAmount = facultyTarget?.raised || totalRaised || 0;
  const percentage = targetAmount > 0 ? (raisedAmount / targetAmount) * 100 : 0;
  const memberTargetAmount = memberTarget?.target_amount || 0;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-gray-500 text-sm font-medium">Faculty Overall Target</h3>
            <p className="text-2xl font-bold text-indigo-600 mt-2">TZS {Number(targetAmount).toLocaleString()}</p>
            <p className="text-sm text-gray-500">Raised: TZS {Number(raisedAmount).toLocaleString()} ({percentage.toFixed(1)}%)</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${Math.min(percentage, 100)}%` }} />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-gray-500 text-sm font-medium">Member Target (Per Member)</h3>
            {memberTargetAmount > 0 ? (
              <>
                <p className="text-2xl font-bold text-green-600 mt-2">TZS {Number(memberTargetAmount).toLocaleString()}</p>
                <button onClick={openTargetModal} className="text-sm text-indigo-600 hover:underline mt-1">Update Target</button>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-gray-400 mt-2">Not Set</p>
                <button onClick={openTargetModal} className="text-sm text-indigo-600 hover:underline mt-1">Set Target</button>
              </>
            )}
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-gray-500 text-sm font-medium">Total Members</h3>
            <p className="text-2xl font-bold text-gray-800 mt-2">{members.length}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-gray-500 text-sm font-medium">Faculty Total Raised</h3>
            <p className="text-2xl font-bold text-purple-600 mt-2">TZS {Number(raisedAmount).toLocaleString()}</p>
          </div>
        </div>

        {/* Members Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <FaUserFriends className="mr-2 text-indigo-600" /> Faculty Members
          </h2>
          {loading ? (
            <p>Loading...</p>
          ) : members.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No members found in your faculty.</p>
              <p className="text-sm">Make sure your faculty has members assigned.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="bg-gray-50"><th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Name</th><th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Member ID</th><th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Mobile</th><th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Total</th><th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th></tr></thead>
                <tbody>
                  {members.map(member => (
                    <tr key={member.id} className="border-t border-gray-100">
                      <td className="py-3 px-4 text-sm">{member.name}</td>
                      <td className="py-3 px-4 text-sm font-mono">{member.member_id}</td>
                      <td className="py-3 px-4 text-sm">{member.mobile}</td>
                      <td className="py-3 px-4 text-sm font-semibold text-indigo-600"><MemberTotal memberId={member.id} /></td>
                      <td className="py-3 px-4 text-sm flex gap-2">
                        <button onClick={() => openAddModal(member)} className="bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 flex items-center gap-1 text-xs"><FaPlus /> Add</button>
                        <button onClick={() => openContributionsModal(member)} className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 flex items-center gap-1 text-xs"><FaEye /> View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals - Keep the same as before */}
      {showAddModal && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button onClick={closeAddModal} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"><FaTimes size={20} /></button>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Add Contribution</h3>
            <p className="text-sm text-gray-600 mb-4">Member: {selectedMember.name} ({selectedMember.member_id})</p>
            {message && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg mb-3">{message}</div>}
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg mb-3">{error}</div>}
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div><label className="block text-gray-700 font-medium mb-1">Amount (TZS)</label><input type="number" className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required /></div>
              <div><label className="block text-gray-700 font-medium mb-1">Date</label><input type="date" className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500" value={form.contribution_date} onChange={(e) => setForm({ ...form, contribution_date: e.target.value })} required /></div>
              <div><label className="block text-gray-700 font-medium mb-1">Description (Optional)</label><input type="text" className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500" placeholder="e.g., Building Fund" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-xl font-semibold hover:bg-indigo-700">Add Contribution</button>
            </form>
          </div>
        </div>
      )}

      {showContributionsModal && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative max-h-[80vh] overflow-y-auto">
            <button onClick={closeContributionsModal} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"><FaTimes size={20} /></button>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Contributions of {selectedMember.name}</h3>
            <p className="text-sm text-gray-600 mb-4">Member ID: {selectedMember.member_id}</p>
            {memberContributions.length === 0 ? <p className="text-gray-500">No contributions yet.</p> : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="bg-gray-50"><th className="text-left py-2 px-3 text-sm font-semibold text-gray-600">Date</th><th className="text-left py-2 px-3 text-sm font-semibold text-gray-600">Amount</th><th className="text-left py-2 px-3 text-sm font-semibold text-gray-600">Description</th><th className="text-left py-2 px-3 text-sm font-semibold text-gray-600">Actions</th></tr></thead>
                  <tbody>
                    {memberContributions.map(c => (
                      <tr key={c.id} className="border-t border-gray-100">
                        <td className="py-2 px-3 text-sm">{c.contribution_date?.split('T')[0]}</td>
                        <td className="py-2 px-3 text-sm font-semibold text-indigo-600">TZS {Number(c.amount).toLocaleString()}</td>
                        <td className="py-2 px-3 text-sm">{c.description || '-'}</td>
                        <td className="py-2 px-3 text-sm flex gap-2">
                          <button onClick={() => { closeContributionsModal(); openEditModal(c); }} className="text-blue-600 hover:text-blue-800"><FaEdit /></button>
                          <button onClick={() => deleteContribution(c.id)} className="text-red-600 hover:text-red-800"><FaTrash /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {showEditModal && selectedContribution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button onClick={closeEditModal} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"><FaTimes size={20} /></button>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Edit Contribution</h3>
            {message && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg mb-3">{message}</div>}
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg mb-3">{error}</div>}
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div><label className="block text-gray-700 font-medium mb-1">Amount (TZS)</label><input type="number" className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} required /></div>
              <div><label className="block text-gray-700 font-medium mb-1">Date</label><input type="date" className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500" value={editForm.contribution_date} onChange={(e) => setEditForm({ ...editForm, contribution_date: e.target.value })} required /></div>
              <div><label className="block text-gray-700 font-medium mb-1">Description (Optional)</label><input type="text" className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500" placeholder="e.g., Building Fund" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} /></div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-xl font-semibold hover:bg-indigo-700">Update Contribution</button>
            </form>
          </div>
        </div>
      )}

      {showTargetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button onClick={closeTargetModal} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"><FaTimes size={20} /></button>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Set Member Target</h3>
            <p className="text-sm text-gray-600 mb-4">Set a target per member of your faculty.</p>
            {targetMessage && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg mb-3">{targetMessage}</div>}
            {targetError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg mb-3">{targetError}</div>}
            <form onSubmit={handleTargetSubmit} className="space-y-4">
              <div><label className="block text-gray-700 font-medium mb-1">Year</label><input type="number" className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500" value={targetForm.year} onChange={(e) => setTargetForm({ ...targetForm, year: e.target.value })} required /></div>
              <div><label className="block text-gray-700 font-medium mb-1">Target Amount (TZS)</label><input type="number" className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500" placeholder="Enter target" value={targetForm.target_amount} onChange={(e) => setTargetForm({ ...targetForm, target_amount: e.target.value })} required /></div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-xl font-semibold hover:bg-indigo-700">Save Target</button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

const MemberTotal = ({ memberId }) => {
  const [total, setTotal] = useState(0);
  useEffect(() => {
    const fetchTotal = async () => {
      try {
        const res = await api.get('/contributions');
        const sum = res.data.filter(c => c.member_id === memberId).reduce((acc, c) => acc + Number(c.amount), 0);
        setTotal(sum);
      } catch (err) { setTotal(0); }
    };
    fetchTotal();
  }, [memberId]);
  return <span>TZS {Number(total).toLocaleString()}</span>;
};

export default FacultyAdminMembers;
