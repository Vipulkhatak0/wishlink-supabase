import { useEffect, useState } from 'react';
import Navbar from '../components/common/Navbar';
import { analyticsAPI, wishAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [wishes, setWishes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([analyticsAPI.getDashboard(), wishAPI.getAll()])
      .then(([aRes, wRes]) => { setStats(aRes.data.stats); setWishes(wRes.data.wishes); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-4xl animate-bounce">💝</div></div>;

  if (!['platinum'].includes(user.plan)) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar/>
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">📊</div>
        <h2 className="font-display text-2xl font-black mb-2">Analytics Requires Platinum</h2>
        <p className="text-gray-500 text-sm mb-6">Upgrade to Platinum to unlock detailed visitor analytics.</p>
        <Link to="/pricing" className="bg-rose-500 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-rose-600">Upgrade Now</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar/>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="font-display text-3xl font-black text-gray-900 mb-8">Analytics 📊</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label:'Total Wishes', value: stats?.totalWishes, icon:'💝' },
            { label:'Active', value: stats?.activeWishes, icon:'✅' },
            { label:'Total Visits', value: stats?.totalVisits, icon:'👁️' },
            { label:'Top Wish Visits', value: stats?.topWish?.visits || 0, icon:'🏆' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="font-display text-3xl font-black text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4">Wish Performance</h3>
          <div className="space-y-3">
            {wishes.map(w => (
              <div key={w._id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <div className="font-semibold text-sm text-gray-800">{w.receiverName}'s {w.occasion}</div>
                  <div className="text-xs text-gray-400">{new Date(w.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{w.visitCount} visits</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${w.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{w.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
