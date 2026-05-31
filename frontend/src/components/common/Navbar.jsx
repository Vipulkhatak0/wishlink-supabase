import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiMenu, FiX, FiUser, FiLogOut, FiSettings, FiBarChart2 } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-rose-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">💝</span>
            <span className="font-display font-bold text-xl text-rose-500">WishLink</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/templates" className="text-gray-600 hover:text-rose-500 transition-colors text-sm font-medium">Templates</Link>
            <Link to="/pricing" className="text-gray-600 hover:text-rose-500 transition-colors text-sm font-medium">Pricing</Link>
            {!user ? (
              <>
                <Link to="/login" className="text-gray-600 hover:text-rose-500 transition-colors text-sm font-medium">Login</Link>
                <Link to="/register" className="bg-rose-500 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-rose-600 transition-colors">Get Started Free</Link>
              </>
            ) : (
              <div className="relative">
                <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 hover:bg-rose-50 rounded-full px-3 py-1.5 transition-colors">
                  <img src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} className="w-8 h-8 rounded-full object-cover" alt={user.name} />
                  <span className="text-sm font-medium text-gray-700">{user.name.split(' ')[0]}</span>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-semibold text-sm text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <span className="inline-block mt-1 bg-rose-100 text-rose-600 text-xs font-bold px-2 py-0.5 rounded-full capitalize">{user.plan} Plan</span>
                    </div>
                    <Link to="/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 transition-colors"><FiUser size={14}/> Dashboard</Link>
                    <Link to="/analytics" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 transition-colors"><FiBarChart2 size={14}/> Analytics</Link>
                    <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 transition-colors"><FiSettings size={14}/> Settings</Link>
                    {user.role === 'admin' && <Link to="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-rose-600 font-semibold hover:bg-rose-50 transition-colors">⚡ Admin Panel</Link>}
                    <hr className="my-1"/>
                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 w-full transition-colors"><FiLogOut size={14}/> Logout</button>
                  </div>
                )}
              </div>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <FiX size={20}/> : <FiMenu size={20}/>}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-rose-100 px-4 py-4 flex flex-col gap-3">
          <Link to="/templates" className="text-gray-600 text-sm py-2" onClick={() => setOpen(false)}>Templates</Link>
          <Link to="/pricing" className="text-gray-600 text-sm py-2" onClick={() => setOpen(false)}>Pricing</Link>
          {!user ? (
            <>
              <Link to="/login" className="text-gray-600 text-sm py-2" onClick={() => setOpen(false)}>Login</Link>
              <Link to="/register" className="bg-rose-500 text-white text-center py-2 rounded-full text-sm font-semibold" onClick={() => setOpen(false)}>Get Started Free</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="text-gray-600 text-sm py-2" onClick={() => setOpen(false)}>Dashboard</Link>
              <button onClick={handleLogout} className="text-red-500 text-sm py-2 text-left">Logout</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
