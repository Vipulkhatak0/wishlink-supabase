import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-7xl mb-6 animate-bounce">💔</div>
        <h1 className="font-display text-5xl font-black text-gray-900 mb-4">Page Not Found</h1>
        <p className="text-gray-500 mb-8">Looks like this page went to find love elsewhere.</p>
        <Link to="/" className="bg-rose-500 text-white px-8 py-3 rounded-full font-bold hover:bg-rose-600 transition-colors">Go Home 💝</Link>
      </div>
    </div>
  );
}
