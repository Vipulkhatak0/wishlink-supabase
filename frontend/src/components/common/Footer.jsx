import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">💝</span>
              <span className="font-display font-bold text-2xl text-rose-400">WishLink</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">Turn your love into beautiful memories. Create personalized wish pages for every celebration.</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-300 mb-4">Product</h4>
            <ul className="space-y-2">
              {['Templates', 'Pricing', 'AI Features', 'How it Works'].map(item => (
                <li key={item}><Link to="/" className="text-gray-400 hover:text-rose-400 text-sm transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-300 mb-4">Occasions</h4>
            <ul className="space-y-2">
              {['Birthday', 'Anniversary', 'Proposal', "Mother's Day", "Father's Day"].map(item => (
                <li key={item}><span className="text-gray-400 text-sm">{item}</span></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-300 mb-4">Legal</h4>
            <ul className="space-y-2">
              {['Privacy Policy', 'Terms of Service', 'Contact Us', 'FAQ'].map(item => (
                <li key={item}><Link to="/" className="text-gray-400 hover:text-rose-400 text-sm transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
          <p>© 2025 WishLink. Made with 💕 for every celebration. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
