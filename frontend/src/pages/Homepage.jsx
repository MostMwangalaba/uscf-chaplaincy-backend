import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaChurch, FaUserPlus, FaSignInAlt, FaHome, FaInfoCircle, FaMoneyBillWave, FaEnvelope, FaChartLine, FaBullseye, FaCheckCircle, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Homepage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/logo.png" alt="USCF Logo" className="h-10 w-auto mr-3" />
              <span className="text-xl font-bold text-gray-800">USCF Chaplaincy</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <button onClick={() => scrollToSection('home')} className="text-gray-700 hover:text-indigo-600 flex items-center gap-1">
                <FaHome /> Home
              </button>
              <button onClick={() => scrollToSection('about')} className="text-gray-700 hover:text-indigo-600 flex items-center gap-1">
                <FaInfoCircle /> About
              </button>
              <button onClick={() => scrollToSection('contributions')} className="text-gray-700 hover:text-indigo-600 flex items-center gap-1">
                <FaMoneyBillWave /> Contributions
              </button>
              <button onClick={() => scrollToSection('contact')} className="text-gray-700 hover:text-indigo-600 flex items-center gap-1">
                <FaEnvelope /> Contact
              </button>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <Link to={user.role === 'super_admin' ? '/super-admin/overview' : user.role === 'faculty_admin' ? '/faculty-admin/overview' : '/dashboard'} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2">
                    <FaSignInAlt /> Login
                  </Link>
                  <Link to="/register" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2">
                    <FaUserPlus /> Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <img src="/logo.png" alt="USCF Logo" className="h-24 w-auto mx-auto mb-6" />
          <h1 className="text-5xl md:text-6xl font-bold mb-4">USCF UDOM Chaplaincy</h1>
          <p className="text-xl md:text-2xl mb-6">Building Fund Management System</p>
          <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90">
            Track your contributions, monitor progress, and help us build a new church.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {user ? (
              <Link to={user.role === 'super_admin' ? '/super-admin/overview' : user.role === 'faculty_admin' ? '/faculty-admin/overview' : '/dashboard'} className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition shadow-lg">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition shadow-lg">Login</Link>
                <Link to="/register" className="bg-green-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-600 transition shadow-lg">Register</Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Why Use Our System?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-2xl p-6 shadow-sm text-center">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaChartLine className="text-indigo-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Track Contributions</h3>
              <p className="text-gray-600 mt-2">Monitor your giving and see your progress toward your personal target.</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 shadow-sm text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaBullseye className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Set Targets</h3>
              <p className="text-gray-600 mt-2">Administrators can set targets for faculties and members to achieve.</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 shadow-sm text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheckCircle className="text-purple-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Transparent & Secure</h3>
              <p className="text-gray-600 mt-2">All records are stored securely, and every contribution is verifiable.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">About USCF Chaplaincy</h2>
          <p className="text-lg text-gray-700 leading-relaxed text-center">
            The USCF UDOM Chaplaincy is a faith-based community committed to spiritual growth and development. 
            We are currently raising funds to build a new church that will serve students, staff, and the surrounding community. 
            This system allows members to contribute, track their giving, and see the collective progress toward our goal.
          </p>
        </div>
      </section>

      {/* Contributions Overview Section */}
      <section id="contributions" className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Contributions Overview</h2>
          <p className="text-lg text-gray-700 mb-8">
            The total funds raised and progress toward the overall target will be displayed here (coming soon).
          </p>
          <div className="bg-indigo-50 rounded-2xl p-8 border border-indigo-100">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Raised:</span>
              <span className="text-2xl font-bold text-indigo-600">TZS 0</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-600">Overall Target:</span>
              <span className="text-2xl font-bold text-gray-800">TZS 0</span>
            </div>
            <div className="mt-4 bg-gray-200 rounded-full h-4">
              <div className="bg-indigo-600 h-4 rounded-full" style={{ width: '0%' }}></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">0% achieved</p>
          </div>
          <p className="text-sm text-gray-400 mt-4">(Real-time data will be available once contributions are recorded.)</p>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Contact Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <FaEnvelope className="text-indigo-600 text-xl" />
                <span className="text-gray-700">chaplaincy@udom.ac.tz</span>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <FaPhone className="text-indigo-600 text-xl" />
                <span className="text-gray-700">+255 123 456 789</span>
              </div>
              <div className="flex items-center gap-3">
                <FaMapMarkerAlt className="text-indigo-600 text-xl" />
                <span className="text-gray-700">UDOM, Dodoma, Tanzania</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <p className="text-gray-600">
                For any inquiries about the building fund, please reach out to the Chaplaincy office.
              </p>
              <p className="text-gray-600 mt-2">
                You can also send a message via the <Link to="/login" className="text-indigo-600 hover:underline">system</Link> once logged in.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p>© {new Date().getFullYear()} USCF UDOM Chaplaincy. All rights reserved.</p>
          <p className="text-sm text-gray-400 mt-1">Building Fund Management System</p>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
