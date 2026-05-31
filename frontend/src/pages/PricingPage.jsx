import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { useAuth } from '../context/AuthContext';
import { paymentAPI } from '../utils/api';
import toast from 'react-hot-toast';

const PLANS = [
  { name:'Free', price:0, icon:'🆓', period:'Forever free', plan:'free',
    features:['1 Wish Page','Basic Template','5 Images','WishLink Watermark'],
    notIncluded:['Music Upload','Video Upload','AI Messages','Custom URL'] },
  { name:'Silver', price:39, icon:'🥈', period:'One-time • 30 days hosting', plan:'silver',
    features:['1 Premium Wish Page','20 Images','Music Upload','Animated Effects','No Watermark'],
    notIncluded:['Video Upload','AI Messages','Custom URL','Analytics'] },
  { name:'Gold', price:59, icon:'🥇', period:'One-time • 90 days hosting', plan:'gold', popular:true,
    features:['Everything in Silver','Unlimited Images','Video Upload','Countdown Timer','Guest Comments','Custom Theme'],
    notIncluded:['AI Messages','Custom URL','Analytics'] },
  { name:'Platinum', price:79, icon:'💎', period:'One-time • Unlimited hosting', plan:'platinum',
    features:['Everything in Gold','AI Message Generator','Custom URL','Visitor Analytics','PDF Download','Priority Support','Premium Animations'] },
];

export default function PricingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState('');

  const handlePurchase = async (plan) => {
    if (!user) { navigate('/register'); return; }
    if (plan === 'free') { navigate('/create'); return; }
    setLoading(plan);
    try {
      const { data } = await paymentAPI.createOrder(plan);
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: 'INR',
        name: 'WishLink',
        description: `${plan.charAt(0).toUpperCase()+plan.slice(1)} Plan`,
        order_id: data.orderId,
        handler: async (response) => {
          try {
            await paymentAPI.verify({ ...response, paymentId: data.paymentId });
            toast.success(`🎉 ${plan} Plan activated!`);
            navigate('/create');
          } catch { toast.error('Payment verification failed'); }
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: '#FF4D6D' },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally { setLoading(''); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar/>
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-14">
          <h1 className="font-display text-5xl font-black text-gray-900 mb-4">Simple, Honest <em className="text-rose-500">Pricing</em></h1>
          <p className="text-gray-500 text-lg">One-time payment. No subscriptions. No hidden fees.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {PLANS.map(p => (
            <div key={p.name} className={`relative rounded-3xl p-8 flex flex-col transition-all hover:-translate-y-1 ${p.popular ? 'bg-gradient-to-br from-purple-700 to-purple-900 text-white shadow-2xl shadow-purple-200' : 'bg-white border-2 border-gray-100 hover:border-rose-200 hover:shadow-lg'}`}>
              {p.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-black px-4 py-1.5 rounded-full whitespace-nowrap">⭐ Most Popular</div>}
              {user?.plan === p.plan && <div className="absolute -top-4 right-4 bg-green-400 text-white text-xs font-black px-3 py-1 rounded-full">Current</div>}
              <div className="text-3xl mb-3">{p.icon}</div>
              <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${p.popular ? 'text-white/60' : 'text-gray-400'}`}>{p.name}</div>
              <div className={`font-display text-4xl font-black mb-1 ${p.popular ? 'text-white' : 'text-gray-900'}`}>
                {p.price === 0 ? 'Free' : <><span className="text-xl">₹</span>{p.price}</>}
              </div>
              <div className={`text-xs mb-6 ${p.popular ? 'text-white/60' : 'text-gray-400'}`}>{p.period}</div>
              <ul className="space-y-2.5 mb-6 flex-1">
                {p.features.map(f => (
                  <li key={f} className={`text-sm flex items-start gap-2 ${p.popular ? 'text-white/90' : 'text-gray-700'}`}>
                    <span className={p.popular ? 'text-yellow-300 mt-0.5' : 'text-green-500 mt-0.5'}>✓</span>{f}
                  </li>
                ))}
                {p.notIncluded?.map(f => (
                  <li key={f} className="text-sm flex items-start gap-2 text-gray-300 line-through">
                    <span className="mt-0.5">✗</span>{f}
                  </li>
                ))}
              </ul>
              <button onClick={() => handlePurchase(p.plan)} disabled={loading === p.plan || user?.plan === p.plan}
                className={`w-full py-3 rounded-full text-sm font-bold transition-all ${p.popular ? 'bg-white text-purple-700 hover:bg-yellow-50' : 'border-2 border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white'} disabled:opacity-50`}>
                {loading === p.plan ? 'Processing...' : user?.plan === p.plan ? '✓ Current Plan' : p.price === 0 ? 'Get Started Free' : `Buy ₹${p.price}`}
              </button>
            </div>
          ))}
        </div>
        {/* FAQ */}
        <div className="mt-20 max-w-2xl mx-auto">
          <h2 className="font-display text-3xl font-black text-center mb-8">Frequently Asked Questions</h2>
          {[
            ['Is this a one-time payment?', 'Yes! No subscriptions. You pay once and your wish page stays live for the hosting duration of your plan.'],
            ['Can I upgrade my plan later?', 'Absolutely! You can upgrade anytime from your dashboard.'],
            ['Is my payment secure?', 'Yes. All payments are processed by Razorpay with bank-grade security.'],
            ['Can I create pages for multiple occasions?', 'Yes! You can create multiple wish pages. The number depends on your plan.'],
          ].map(([q,a]) => (
            <div key={q} className="border-b border-gray-200 py-5">
              <div className="font-semibold text-gray-900 mb-2">{q}</div>
              <p className="text-gray-500 text-sm leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer/>
    </div>
  );
}
