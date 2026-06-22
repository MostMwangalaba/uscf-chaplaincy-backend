import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaHome, FaQrcode, FaDollarSign, FaFileAlt, FaBullhorn, FaLayerGroup,
  FaUser, FaCog, FaSignOutAlt, FaBars, FaTimes, FaBell, FaChurch,
  FaUsers, FaDatabase, FaUserFriends, FaChartLine, FaBuilding, FaFileExport, FaSearch,
  FaComments
} from 'react-icons/fa';

const Layout = ({ children, menuItems }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const memberMenu = [
    { icon: FaHome, label: 'Dashboard', path: '/dashboard' },
    { icon: FaQrcode, label: 'My QR Code', path: '/qr' },
    { icon: FaDollarSign, label: 'My Contributions', path: '/contributions' },
    { icon: FaFileAlt, label: 'Building Fund Statement', path: '/statement' },
    { icon: FaBullhorn, label: 'Advice & Announcements', path: '/announcements' },
    { icon: FaLayerGroup, label: 'Building Progress', path: '/progress' },
  ];

  const facultyAdminMenu = [
    { icon: FaChartLine, label: 'Overview', path: '/faculty-admin/overview' },
    { icon: FaBuilding, label: 'Building Analytics', path: '/faculty-admin/building' },
    { icon: FaFileExport, label: 'Export Reports', path: '/faculty-admin/export' },
    { icon: FaUserFriends, label: 'Members', path: '/faculty-admin/members' },
    { icon: FaComments, label: 'Messages', path: '/faculty-admin/messages' },
    { icon: FaBullhorn, label: 'Broadcast', path: '/faculty-admin/broadcast' },
    { icon: FaComments, label: 'Advices', path: '/faculty-admin/advices' },
    { icon: FaSearch, label: 'Faculty Reports', path: '/faculty-admin/reports' },
  ];

 const superAdminMenu = [
  { icon: FaChartLine, label: 'Overview', path: '/super-admin/overview' },
  { icon: FaUserFriends, label: 'Members', path: '/super-admin/members' },
  { icon: FaUsers, label: 'User Management', path: '/super-admin/users' },
  { icon: FaDollarSign, label: 'Targets & Goals', path: '/super-admin/targets' },
  { icon: FaDatabase, label: 'Backups', path: '/super-admin/backups' },
  { icon: FaCog, label: 'Audit Logs', path: '/super-admin/audit' },
  { icon: FaComments, label: 'Messages', path: '/super-admin/messages' },
];

  const navItems = menuItems || (() => {
    const role = user?.role;
    if (role === 'super_admin') return superAdminMenu;
    if (role === 'faculty_admin' || role === 'leader') return facultyAdminMenu;
    return memberMenu;
  })();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-indigo-800 to-indigo-900 text-white transform transition-all duration-300 lg:translate-x-0 lg:static lg:inset-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-indigo-700/50">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="USCF Logo" className="h-12 w-auto" />
            <div>
              <span className="font-bold text-lg">USCF</span>
              <span className="text-xs text-indigo-300 block">Chaplaincy</span>
            </div>
          </div>
          <button className="lg:hidden text-white hover:text-indigo-200" onClick={() => setSidebarOpen(false)}>
            <FaTimes size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-indigo-700 text-white shadow-lg shadow-indigo-800/30'
                  : 'text-indigo-200 hover:bg-indigo-700/50 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-indigo-700/50">
          <div className="flex items-center space-x-3 px-4 py-3 bg-indigo-700/30 rounded-xl">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <span className="font-bold text-lg">{user?.name?.charAt(0) || 'U'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-indigo-300 truncate capitalize">{user?.role || 'Member'}</p>
            </div>
          </div>
          <div className="mt-2 space-y-1">
            <Link to="/profile" className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl hover:bg-indigo-700/50 transition-colors duration-200 text-indigo-200 hover:text-white">
              <FaUser size={20} /><span className="font-medium">My Profile</span>
            </Link>
            <Link to="/settings" className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl hover:bg-indigo-700/50 transition-colors duration-200 text-indigo-200 hover:text-white">
              <FaCog size={20} /><span className="font-medium">Settings</span>
            </Link>
            <button onClick={handleLogout} className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl hover:bg-red-500/20 transition-colors duration-200 text-red-300 hover:text-red-200">
              <FaSignOutAlt size={20} /><span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4 flex items-center justify-between lg:justify-end sticky top-0 z-30">
          <button className="lg:hidden text-gray-700 hover:text-gray-900" onClick={() => setSidebarOpen(true)}>
            <FaBars size={24} />
          </button>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
              <FaBell size={20} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 hidden sm:inline">Welcome, {user?.name?.split(' ')[0] || 'User'}</span>
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {user?.name?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
