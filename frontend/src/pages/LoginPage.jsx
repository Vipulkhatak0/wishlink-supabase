import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email:'', password:'' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 💝');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <span className="text-3xl">💝</span>
          <span className="font-display font-bold text-2xl text-rose-500">WishLink</span>
        </Link>
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <h1 className="font-display text-3xl font-black text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-500 text-sm mb-8">Sign in to your WishLink account</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})} required placeholder="you@example.com" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-400 transition-colors"/>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Password</label>
              <input type="password" value={form.password} onChange={e => setForm({...form, password:e.target.value})} required placeholder="••••••••" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-400 transition-colors"/>
            </div>
            <div className="flex justify-end"><Link to="/forgot-password" className="text-xs text-rose-500 hover:underline">Forgot password?</Link></div>
            <button type="submit" disabled={loading} className="w-full bg-rose-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-rose-600 transition-colors disabled:opacity-50">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">Don't have an account? <Link to="/register" className="text-rose-500 font-semibold hover:underline">Sign up free</Link></p>
        </div>
      </div>
    </div>
  );
}
