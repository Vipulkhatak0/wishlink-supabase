import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { wishAPI, analyticsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const [wishes, setWishes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([wishAPI.getAll(), analyticsAPI.getDashboard()])
      .then(([wRes, aRes]) => { setWishes(wRes.data.wishes); setStats(aRes.data.stats); })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-4xl animate-bounce">💝</div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar/>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-black text-gray-900">Dashboard 👋</h1>
            <p className="text-gray-500 text-sm mt-1">Welcome back, {user.name.split(' ')[0]}!</p>
          </div>
          <Link to="/create" className="bg-rose-500 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-rose-600 transition-colors flex items-center gap-2">+ Create Wish</Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label:'Total Wishes', value: stats?.totalWishes || 0, icon:'💝', color:'bg-rose-50 border-rose-100' },
            { label:'Active Wishes', value: stats?.activeWishes || 0, icon:'✅', color:'bg-green-50 border-green-100' },
            { label:'Total Visits', value: stats?.totalVisits || 0, icon:'👁️', color:'bg-blue-50 border-blue-100' },
            { label:'Current Plan', value: user.plan.charAt(0).toUpperCase()+user.plan.slice(1), icon:'⭐', color:'bg-yellow-50 border-yellow-100' },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl border p-5 ${s.color}`}>
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="font-display text-2xl font-black text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Plan upgrade banner */}
        {user.plan === 'free' && (
          <div className="bg-gradient-to-r from-rose-500 to-rose-600 rounded-2xl p-6 mb-8 flex items-center justify-between text-white">
            <div>
              <div className="font-bold text-lg mb-1">Upgrade for more features ✨</div>
              <div className="text-sm text-rose-100">Get unlimited images, music, video & no watermark from just ₹39</div>
            </div>
            <Link to="/pricing" className="bg-white text-rose-600 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-rose-50 transition-colors whitespace-nowrap ml-4">Upgrade Now</Link>
          </div>
        )}

        {/* Wishes */}
        <h2 className="font-display text-xl font-black text-gray-900 mb-4">My Wish Pages</h2>
        {wishes.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center">
            <div className="text-5xl mb-4">💝</div>
            <h3 className="font-display text-xl font-bold text-gray-800 mb-2">No wishes yet</h3>
            <p className="text-gray-500 text-sm mb-6">Create your first wish page and make someone special feel loved!</p>
            <Link to="/create" className="bg-rose-500 text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-rose-600 transition-colors">Create First Wish</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {wishes.map(w => (
              <div key={w._id} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-all hover:-translate-y-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{w.title || `${w.receiverName}'s ${w.occasion}`}</h3>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold ${w.status === 'active' ? 'bg-green-100 text-green-700' : w.status === 'draft' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>{w.status}</span>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(w.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span>👁️ {w.visitCount} visits</span>
                  {w.expiresAt && <span>⏳ {new Date(w.expiresAt).toLocaleDateString()}</span>}
                </div>
                <div className="flex gap-2">
                  {w.status === 'active' && <a href={`/w/${w.slug}`} target="_blank" rel="noreferrer" className="flex-1 text-center py-2 text-xs font-bold text-rose-500 border border-rose-200 rounded-xl hover:bg-rose-50 transition-colors">View</a>}
                  <Link to={`/edit/${w._id}`} className="flex-1 text-center py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Edit</Link>
                  {w.status === 'active' && (
                    <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/w/${w.slug}`); toast.success('Link copied!'); }} className="px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">🔗</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
