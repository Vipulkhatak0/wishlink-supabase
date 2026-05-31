import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { wishAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function MyWishes() {
  const [wishes, setWishes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    wishAPI.getAll().then(r => setWishes(r.data.wishes)).finally(() => setLoading(false));
  }, []);

  const deleteWish = async (id) => {
    if (!confirm('Delete this wish?')) return;
    try { await wishAPI.delete(id); setWishes(w => w.filter(x => x._id !== id)); toast.success('Deleted'); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar/>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-black">My Wishes 💝</h1>
          <Link to="/create" className="bg-rose-500 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-rose-600">+ Create New</Link>
        </div>
        {loading ? <div className="text-center py-20 text-4xl animate-bounce">💝</div> : (
          <div className="space-y-4">
            {wishes.map(w => (
              <div key={w._id} className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">{w.receiverName}'s {w.occasion}</h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${w.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{w.status}</span>
                    <span>👁️ {w.visitCount} visits</span>
                    <span>{new Date(w.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {w.status === 'active' && <a href={`/w/${w.slug}`} target="_blank" rel="noreferrer" className="px-4 py-2 text-sm font-bold text-rose-500 border border-rose-200 rounded-xl hover:bg-rose-50">View</a>}
                  <Link to={`/edit/${w._id}`} className="px-4 py-2 text-sm font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">Edit</Link>
                  <button onClick={() => deleteWish(w._id)} className="px-4 py-2 text-sm font-bold text-red-500 border border-red-100 rounded-xl hover:bg-red-50">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
