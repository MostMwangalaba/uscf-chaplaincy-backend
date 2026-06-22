import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaChurch, FaEnvelope, FaLock } from 'react-icons/fa';

const Login = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login: loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await loginUser(login, password);
    setLoading(false);
    if (result.success) {
      const role = result.user.role;
      if (role === 'super_admin') navigate('/super-admin/overview');
      else if (role === 'faculty_admin') navigate('/faculty-admin/overview');
      else if (role === 'leader') navigate('/leader/dashboard');
      else navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative"
         style={{ backgroundImage: "url('/logo.png')" }}>
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-sm"></div>
      
      <div className="relative z-10 bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/50">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
            <FaChurch className="text-white text-3xl" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">USCF Chaplaincy</h2>
          <p className="text-gray-500 mt-1">Building Fund Management System</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1.5 text-sm">Email or Mobile</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="w-full border border-gray-200 rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/80"
                placeholder="Enter your email or mobile"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1.5 text-sm">Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                className="w-full border border-gray-200 rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/80"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] shadow-lg shadow-indigo-200 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
