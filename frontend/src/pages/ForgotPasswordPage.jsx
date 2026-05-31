import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset email sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <span className="text-3xl">💝</span><span className="font-display font-bold text-2xl text-rose-500">WishLink</span>
        </Link>
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          {sent ? (
            <div className="text-center"><div className="text-5xl mb-4">📧</div><h2 className="font-display text-2xl font-black mb-2">Check your email</h2><p className="text-gray-500 text-sm">We sent a reset link to {email}</p><Link to="/login" className="mt-6 inline-block text-rose-500 font-semibold text-sm">Back to Login</Link></div>
          ) : (
            <>
              <h1 className="font-display text-3xl font-black text-gray-900 mb-2">Forgot Password?</h1>
              <p className="text-gray-500 text-sm mb-8">Enter your email to receive a reset link</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-400"/>
                <button type="submit" disabled={loading} className="w-full bg-rose-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-rose-600 transition-colors disabled:opacity-50">{loading ? 'Sending...' : 'Send Reset Link'}</button>
              </form>
              <p className="text-center text-sm text-gray-500 mt-6"><Link to="/login" className="text-rose-500 font-semibold">Back to Login</Link></p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
