import { useState } from 'react';
import Navbar from '../components/common/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', avatar: user?.avatar || '' });
  const [pwdForm, setPwdForm] = useState({ currentPassword:'', newPassword:'' });
  const [saving, setSaving] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/api/auth/update-profile', form);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
    finally { setSaving(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/api/auth/update-password', pwdForm);
      setPwdForm({ currentPassword:'', newPassword:'' });
      toast.success('Password changed!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password'); }
    finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar/>
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="font-display text-3xl font-black text-gray-900 mb-8">Profile Settings ⚙️</h1>

        {/* Plan badge */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-4">
            <img src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`} className="w-16 h-16 rounded-full object-cover"/>
            <div>
              <h2 className="font-bold text-lg text-gray-900">{user?.name}</h2>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              <span className="inline-block mt-1 bg-rose-100 text-rose-600 text-xs font-bold px-3 py-1 rounded-full capitalize">{user?.plan} Plan</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-4">Update Profile</h3>
          <form onSubmit={saveProfile} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Name</label>
              <input value={form.name} onChange={e => setForm({...form, name:e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-400"/>
            </div>
            <button type="submit" disabled={saving} className="bg-rose-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-rose-600 disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </div>

        {!user?.googleId && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-4">Change Password</h3>
            <form onSubmit={changePassword} className="space-y-4">
              <input type="password" value={pwdForm.currentPassword} onChange={e => setPwdForm({...pwdForm, currentPassword:e.target.value})} placeholder="Current password" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-400"/>
              <input type="password" value={pwdForm.newPassword} onChange={e => setPwdForm({...pwdForm, newPassword:e.target.value})} placeholder="New password (min 6 chars)" minLength="6" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-400"/>
              <button type="submit" disabled={saving} className="bg-rose-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-rose-600 disabled:opacity-50">{saving ? 'Updating...' : 'Update Password'}</button>
            </form>
          </div>
        )}

        <div className="bg-rose-50 rounded-2xl border border-rose-100 p-6">
          <h3 className="font-bold text-gray-900 mb-2">Referral Program 🎁</h3>
          <p className="text-sm text-gray-500 mb-3">Share your code and earn rewards!</p>
          <div className="flex items-center gap-3 bg-white rounded-xl border border-rose-200 p-3">
            <span className="font-mono font-bold text-rose-500">{user?.referralCode}</span>
            <button onClick={() => { navigator.clipboard.writeText(user?.referralCode); toast.success('Copied!'); }} className="ml-auto text-xs text-gray-500 hover:text-rose-500">Copy</button>
          </div>
          <p className="text-xs text-gray-400 mt-2">Referred users: {user?.referralCount || 0}</p>
        </div>
      </div>
    </div>
  );
}
