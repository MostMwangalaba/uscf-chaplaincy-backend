import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import { 
  FaChartLine, FaUsers, FaDollarSign, FaDatabase, FaBullhorn, FaCog, FaUserFriends,
  FaEye, FaTrash, FaTimes, FaSave, FaEdit, FaUserTie, FaPlus
} from 'react-icons/fa';

const SuperAdminUsers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    mobile: '',
    faculty_id: '',
    role: '',
  });
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    faculty_id: '',
    role: 'faculty_admin',
  });
  const [updating, setUpdating] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchData();
  }, [user, navigate]);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get('/users'),
      api.get('/faculties')
    ])
      .then(([usersRes, facultiesRes]) => {
        console.log('All users:', usersRes.data);
        // Filter only admin users (faculty_admin or super_admin)
        const adminList = usersRes.data.filter(u => u.role === 'faculty_admin' || u.role === 'super_admin');
        console.log('Admin users:', adminList);
        setAdmins(adminList);
        setFaculties(facultiesRes.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching data:', err);
        setLoading(false);
      });
  };

  const openModal = (admin) => {
    setSelectedAdmin(admin);
    setEditForm({
      name: admin.name || '',
      email: admin.email || '',
      mobile: admin.mobile || '',
      faculty_id: admin.faculty_id || '',
      role: admin.role || 'faculty_admin',
    });
    setShowModal(true);
    setMessage('');
    setError('');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAdmin(null);
  };

  const openCreateModal = () => {
    setShowCreateModal(true);
    setCreateForm({ name: '', email: '', mobile: '', password: '', faculty_id: '', role: 'faculty_admin' });
    setMessage('');
    setError('');
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage('');
    setError('');
    try {
      await api.put(`/users/${selectedAdmin.id}`, editForm);
      setMessage('Admin updated successfully!');
      fetchData();
      setTimeout(() => closeModal(), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setMessage('');
    setError('');
    try {
      await api.post('/users', createForm);
      setMessage('Admin created successfully!');
      fetchData();
      setTimeout(() => closeCreateModal(), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Creation failed');
    } finally {
      setCreating(false);
    }
  };

  const deleteAdmin = async (id) => {
    if (!window.confirm('Are you sure you want to delete this admin?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchData();
      setMessage('Admin deleted successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert('Error deleting admin');
    }
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <FaUserTie className="mr-2 text-indigo-600" />
              Admin Users Management
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">Total: {admins.length} admins</span>
              <button
                onClick={openCreateModal}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm"
              >
                <FaPlus /> Add Admin
              </button>
            </div>
          </div>

          {message && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4">{message}</div>}
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">{error}</div>}

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : admins.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No admin users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Mobile</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Faculty</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Role</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map(a => (
                    <tr key={a.id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                      <td className="py-3 px-4 text-sm">{a.name}</td>
                      <td className="py-3 px-4 text-sm">{a.email || '-'}</td>
                      <td className="py-3 px-4 text-sm">{a.mobile}</td>
                      <td className="py-3 px-4 text-sm">{a.faculty?.name || 'N/A'}</td>
                      <td className="py-3 px-4 text-sm capitalize">{a.role}</td>
                      <td className="py-3 px-4 text-sm flex gap-2">
                        <button
                          onClick={() => openModal(a)}
                          className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 flex items-center gap-1 text-xs"
                        >
                          <FaEye /> View
                        </button>
                        <button
                          onClick={() => deleteAdmin(a.id)}
                          className="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 flex items-center gap-1 text-xs"
                        >
                          <FaTrash /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showModal && selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative">
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
              <FaTimes size={20} />
            </button>
            <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
              <FaEdit className="mr-2 text-indigo-600" /> Edit Admin
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              ID: <span className="font-mono font-medium">{selectedAdmin.member_id}</span>
            </p>
            {message && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg mb-3">{message}</div>}
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg mb-3">{error}</div>}
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Full Name</label>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500" required />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Email</label>
                <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Mobile</label>
                <input type="text" value={editForm.mobile} onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500" required />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Faculty</label>
                <select value={editForm.faculty_id} onChange={(e) => setEditForm({ ...editForm, faculty_id: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500" required>
                  <option value="">Select Faculty</option>
                  {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Role</label>
                <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500">
                  <option value="faculty_admin">Faculty Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <button type="submit" disabled={updating} className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2">
                <FaSave /> {updating ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative">
            <button onClick={closeCreateModal} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
              <FaTimes size={20} />
            </button>
            <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
              <FaPlus className="mr-2 text-green-600" /> Create New Admin
            </h3>
            {message && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg mb-3">{message}</div>}
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg mb-3">{error}</div>}
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Full Name</label>
                <input type="text" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500" required />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Email</label>
                <input type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Mobile</label>
                <input type="text" value={createForm.mobile} onChange={(e) => setCreateForm({ ...createForm, mobile: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500" required />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Password</label>
                <input type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500" required minLength="6" />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Faculty</label>
                <select value={createForm.faculty_id} onChange={(e) => setCreateForm({ ...createForm, faculty_id: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500" required>
                  <option value="">Select Faculty</option>
                  {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Role</label>
                <select value={createForm.role} onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500">
                  <option value="faculty_admin">Faculty Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <button type="submit" disabled={creating} className="w-full bg-green-600 text-white py-2.5 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2">
                <FaSave /> {creating ? 'Creating...' : 'Create Admin'}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default SuperAdminUsers;
