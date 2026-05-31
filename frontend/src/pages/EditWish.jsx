import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { wishAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function EditWish() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [wish, setWish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    wishAPI.getOne(id).then(r => setWish(r.data.wish)).catch(() => navigate('/dashboard')).finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try { await wishAPI.update(id, wish); toast.success('Saved!'); navigate('/dashboard'); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handlePublish = async () => {
    setSaving(true);
    try { await wishAPI.publish(id); toast.success('Published! 🎉'); navigate(`/w/${wish.slug}`); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to publish'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-4xl animate-bounce">💝</div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar/>
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="font-display text-3xl font-black text-gray-900 mb-8">Edit Wish ✏️</h1>
        <div className="bg-white rounded-3xl border border-gray-100 p-8 space-y-5">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Receiver Name</label>
            <input value={wish.receiverName} onChange={e => setWish({...wish, receiverName:e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-400"/>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Message</label>
            <textarea value={wish.message || ''} onChange={e => setWish({...wish, message:e.target.value})} rows={5} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-400 resize-none"/>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving} className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-bold text-sm hover:border-gray-400 disabled:opacity-50">Save Draft</button>
            {wish.status !== 'active' && <button onClick={handlePublish} disabled={saving} className="flex-1 bg-rose-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-rose-600 disabled:opacity-50">Publish 🎉</button>}
            {wish.status === 'active' && <a href={`/w/${wish.slug}`} target="_blank" rel="noreferrer" className="flex-1 text-center py-3 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600">View Live 👁️</a>}
          </div>
        </div>
      </div>
    </div>
  );
}
