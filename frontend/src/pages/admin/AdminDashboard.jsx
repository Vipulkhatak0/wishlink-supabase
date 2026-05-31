import { useEffect, useState } from 'react';
import Navbar from '../../components/common/Navbar';
import { adminAPI } from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminAPI.getDashboard(), adminAPI.getUsers(), adminAPI.getPayments()])
      .then(([dRes, uRes, pRes]) => { setStats(dRes.data.stats); setUsers(uRes.data.users); setPayments(pRes.data.payments); })
      .catch(() => toast.error('Failed to load admin data'))
      .finally(() => setLoading(false));
  }, []);

  const toggleUser = async (id) => {
    try { const { data } = await adminAPI.toggleUser(id); setUsers(u => u.map(x => x._id === id ? data.user : x)); toast.success('User status updated'); }
    catch { toast.error('Failed'); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-4xl animate-bounce">⚡</div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar/>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="font-display text-3xl font-black text-gray-900 mb-8">⚡ Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label:'Total Users', value: stats?.totalUsers, icon:'👥', color:'bg-blue-50' },
            { label:'Total Wishes', value: stats?.totalWishes, icon:'💝', color:'bg-rose-50' },
            { label:'Active Wishes', value: stats?.activeWishes, icon:'✅', color:'bg-green-50' },
            { label:'Total Revenue', value: `₹${((stats?.totalRevenue||0)/100).toFixed(0)}`, icon:'💰', color:'bg-yellow-50' },
          ].map(s => (
            <div key={s.label} className={`${s.color} rounded-2xl p-5 border border-gray-100`}>
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="font-display text-2xl font-black">{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['overview','users','payments'].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-5 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${tab===t ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'}`}>{t}</button>
          ))}
        </div>

        {tab === 'users' && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Name','Email','Plan','Wishes','Status','Action'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3"><span className="bg-rose-100 text-rose-600 text-xs font-bold px-2 py-0.5 rounded-full capitalize">{u.plan}</span></td>
                    <td className="px-4 py-3 text-gray-500">{u.wishCount}</td>
                    <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{u.isActive ? 'Active' : 'Banned'}</span></td>
                    <td className="px-4 py-3"><button onClick={() => toggleUser(u._id)} className={`text-xs font-bold px-3 py-1 rounded-lg ${u.isActive ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-green-50 text-green-500 hover:bg-green-100'}`}>{u.isActive ? 'Ban' : 'Unban'}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'payments' && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['User','Plan','Amount','Status','Date'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{p.user?.name}</td>
                    <td className="px-4 py-3 capitalize">{p.plan}</td>
                    <td className="px-4 py-3 font-bold text-green-600">₹{p.amount/100}</td>
                    <td className="px-4 py-3"><span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full capitalize">{p.status}</span></td>
                    <td className="px-4 py-3 text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-bold mb-4">Recent Users</h3>
              <div className="space-y-3">
                {users.slice(0,5).map(u => (
                  <div key={u._id} className="flex items-center gap-3">
                    <img src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`} className="w-8 h-8 rounded-full"/>
                    <div className="flex-1"><div className="text-sm font-medium">{u.name}</div><div className="text-xs text-gray-400">{u.email}</div></div>
                    <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full capitalize">{u.plan}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-bold mb-4">Recent Payments</h3>
              <div className="space-y-3">
                {payments.slice(0,5).map(p => (
                  <div key={p._id} className="flex items-center justify-between">
                    <div><div className="text-sm font-medium">{p.user?.name}</div><div className="text-xs text-gray-400 capitalize">{p.plan} plan</div></div>
                    <span className="font-bold text-green-600">₹{p.amount/100}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
