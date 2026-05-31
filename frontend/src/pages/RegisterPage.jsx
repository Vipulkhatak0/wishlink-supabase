import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', password:'', referralCode:'' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.referralCode);
      toast.success('Account created! Welcome to WishLink 💝');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
          <h1 className="font-display text-3xl font-black text-gray-900 mb-2">Create account</h1>
          <p className="text-gray-500 text-sm mb-8">Start creating beautiful wish pages for free</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label:'Your Name', type:'text', key:'name', placeholder:'Priya Sharma' },
              { label:'Email', type:'email', key:'email', placeholder:'you@example.com' },
              { label:'Password', type:'password', key:'password', placeholder:'Min. 6 characters' },
              { label:'Referral Code (Optional)', type:'text', key:'referralCode', placeholder:'FRIEND123' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">{f.label}</label>
                <input type={f.type} value={form[f.key]} onChange={e => setForm({...form, [f.key]:e.target.value})}
                  required={f.key !== 'referralCode'} placeholder={f.placeholder}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-400 transition-colors"/>
              </div>
            ))}
            <button type="submit" disabled={loading} className="w-full bg-rose-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-rose-600 transition-colors disabled:opacity-50">
              {loading ? 'Creating account...' : 'Create Free Account'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">Already have an account? <Link to="/login" className="text-rose-500 font-semibold hover:underline">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
