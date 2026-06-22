import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { FaUser, FaPhone, FaLock, FaUniversity } from 'react-icons/fa';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    password: '',
    faculty_id: '',
  });
  const [faculties, setFaculties] = useState([]);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/faculties')
      .then(res => {
        setFaculties(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching faculties:', err);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});
    try {
      const result = await register(form);
      if (result.success) {
        navigate('/dashboard');
      } else {
        if (result.error?.errors) {
          setValidationErrors(result.error.errors);
          setError('Please fix the highlighted fields.');
        } else {
          setError(result.error || 'Registration failed');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative"
         style={{ backgroundImage: "url('/logo.png')" }}>
      <div className="absolute inset-0 bg-white/70 backdrop-blur-sm"></div>

      <div className="relative z-10 bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/50">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200">
            <FaUser className="text-white text-3xl" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
          <p className="text-gray-500 mt-1">Join USCF Chaplaincy</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1.5 text-sm">Full Name</label>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className={`w-full border ${validationErrors.name ? 'border-red-500' : 'border-gray-200'} rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/80`}
                placeholder="Enter your full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            {validationErrors.name && <p className="text-red-500 text-xs mt-1">{validationErrors.name[0]}</p>}
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1.5 text-sm">Mobile Number</label>
            <div className="relative">
              <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className={`w-full border ${validationErrors.mobile ? 'border-red-500' : 'border-gray-200'} rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/80`}
                placeholder="Enter your mobile number"
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                required
              />
            </div>
            {validationErrors.mobile && <p className="text-red-500 text-xs mt-1">{validationErrors.mobile[0]}</p>}
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1.5 text-sm">Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                className={`w-full border ${validationErrors.password ? 'border-red-500' : 'border-gray-200'} rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/80`}
                placeholder="Create a strong password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            {validationErrors.password && <p className="text-red-500 text-xs mt-1">{validationErrors.password[0]}</p>}
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1.5 text-sm">Faculty</label>
            <div className="relative">
              <FaUniversity className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                className={`w-full border ${validationErrors.faculty_id ? 'border-red-500' : 'border-gray-200'} rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/80 appearance-none`}
                value={form.faculty_id}
                onChange={(e) => setForm({ ...form, faculty_id: e.target.value })}
                required
              >
                <option value="">Select your faculty</option>
                {faculties.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
            {loading && <p className="text-xs text-gray-400 mt-1">Loading faculties...</p>}
            {!loading && faculties.length === 0 && <p className="text-xs text-red-400 mt-1">No faculties available. Please contact admin.</p>}
            {validationErrors.faculty_id && <p className="text-red-500 text-xs mt-1">{validationErrors.faculty_id[0]}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3.5 rounded-xl font-semibold hover:from-green-700 hover:to-teal-700 transition-all duration-200 transform hover:scale-[1.02] shadow-lg shadow-green-200"
          >
            Register
          </button>
        </form>
        <p className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-green-600 font-semibold hover:text-green-800 transition-colors">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
