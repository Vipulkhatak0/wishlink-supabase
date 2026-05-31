import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    axios.get(`/api/auth/verify-email/${token}`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-md">
        {status === 'loading' && <><div className="text-5xl mb-4 animate-bounce">⏳</div><p>Verifying...</p></>}
        {status === 'success' && <><div className="text-5xl mb-4">✅</div><h2 className="font-display text-2xl font-black mb-2">Email Verified!</h2><p className="text-gray-500 mb-6">Your account is now active.</p><Link to="/dashboard" className="bg-rose-500 text-white px-6 py-3 rounded-full font-bold text-sm">Go to Dashboard</Link></>}
        {status === 'error' && <><div className="text-5xl mb-4">❌</div><h2 className="font-display text-2xl font-black mb-2">Invalid Link</h2><p className="text-gray-500">This verification link is invalid or expired.</p></>}
      </div>
    </div>
  );
}
