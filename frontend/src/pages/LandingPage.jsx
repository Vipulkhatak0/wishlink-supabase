import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { aiAPI } from '../utils/api';

const OCCASIONS = [
  { emoji:'🎂', name:'Birthday', label:'Most Popular', featured:true },
  { emoji:'💍', name:'Proposal', label:'Romantic' },
  { emoji:'💑', name:'Anniversary', label:'Eternal Love' },
  { emoji:'👩‍👧', name:"Mother's Day", label:'Show her love' },
  { emoji:'👨‍👦', name:"Father's Day", label:'Celebrate dad' },
  { emoji:'🎓', name:'Graduation', label:'Proud moment' },
  { emoji:'👶', name:'Baby Shower', label:'New arrival' },
  { emoji:'🎆', name:'Festival', label:'Diwali & more' },
  { emoji:'💝', name:"Valentine's", label:'Love letter' },
  { emoji:'🤝', name:'Friendship Day', label:'Forever friends' },
  { emoji:'👋', name:'Farewell', label:'Goodbye memory' },
  { emoji:'✨', name:'Custom', label:'Your idea' },
];

const PRICING = [
  { name:'Free', price:0, icon:'🆓', period:'Forever free', features:['1 Wish Page','Basic Template','5 Images','WishLink Watermark'], plan:'free' },
  { name:'Silver', price:39, icon:'🥈', period:'One-time · 30 days', features:['1 Premium Page','20 Images','Music Upload','Animated Effects','No Watermark'], plan:'silver' },
  { name:'Gold', price:59, icon:'🥇', period:'One-time · 90 days', features:['Everything in Silver','Unlimited Images','Video Upload','Countdown Timer','Guest Comments'], plan:'gold', popular:true },
  { name:'Platinum', price:79, icon:'💎', period:'One-time · Unlimited', features:['Everything in Gold','AI Message Generator','Custom URL','Visitor Analytics','PDF Download','Priority Support'], plan:'platinum' },
];

const TESTIMONIALS = [
  { stars:5, text:'I proposed to my girlfriend through a WishLink page with all our memories. She said yes and cried happy tears. Best ₹79 I ever spent!', name:'Arjun Rawat', loc:'Chandigarh · Proposal', initials:'AR', color:'bg-rose-100 text-rose-600' },
  { stars:5, text:'Made a birthday page for my mom with all our childhood photos. She showed it to every aunty in the family. Absolute magic!', name:'Priya Sharma', loc:'Delhi · Birthday', initials:'PS', color:'bg-green-100 text-green-600' },
  { stars:5, text:'The AI wrote a Hindi love letter for my anniversary. My wife read it 10 times. WishLink literally saved my marriage!', name:'Vikram Kumar', loc:'Mumbai · Anniversary', initials:'VK', color:'bg-blue-100 text-blue-600' },
];

const FLOATERS = ['❤️','💕','🎈','✨','🌸','💫','🎊','💖','🎀','⭐'];

export default function LandingPage() {
  const navigate = useNavigate();
  const [aiForm, setAiForm] = useState({ occasion:'birthday', receiverName:'', relationship:'best friend', language:'english' });
  const [aiMsg, setAiMsg] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [floaters, setFloaters] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setFloaters(f => [...f.slice(-12), {
        id: Date.now(),
        emoji: FLOATERS[Math.floor(Math.random()*FLOATERS.length)],
        left: Math.random()*100,
        size: 16+Math.random()*20,
        duration: 8+Math.random()*6,
      }]);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const generateAI = async () => {
    if (!aiForm.receiverName) return;
    setAiLoading(true);
    try {
      const { data } = await aiAPI.generateMessage(aiForm);
      setAiMsg(data.message);
    } catch {
      setAiMsg('Could not generate message. Please try again.');
    } finally { setAiLoading(false); }
  };

  const fadeUp = { hidden:{opacity:0,y:30}, visible:{opacity:1,y:0} };

  return (
    <div className="min-h-screen bg-rose-50/30">
      <Navbar/>

      {/* Hero */}
      <section className="relative overflow-hidden min-h-screen flex flex-col items-center justify-center text-center px-4 py-24">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {floaters.map(f => (
            <span key={f.id} className="absolute animate-bounce" style={{ left:`${f.left}%`, bottom:0, fontSize:f.size, animationDuration:`${f.duration}s`, opacity:0.6 }}>{f.emoji}</span>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-radial from-rose-100/40 via-transparent to-transparent pointer-events-none"/>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{duration:0.6}} className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-600 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">✨ 50,000+ Wishes Created</div>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 leading-tight mb-6">
            Turn Your Love Into a <em className="text-rose-500 not-italic">Beautiful Memory</em>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Create personalized wish websites for birthdays, anniversaries, proposals, parents, friends & loved ones. Share with a single magical link.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/create" className="bg-rose-500 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-rose-600 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-200 flex items-center justify-center gap-2">💝 Create a Wish</Link>
            <Link to="/templates" className="bg-white text-gray-800 border-2 border-gray-200 px-8 py-4 rounded-full text-lg font-bold hover:border-rose-300 hover:text-rose-500 transition-all hover:-translate-y-1 flex items-center justify-center gap-2">🎨 Explore Templates</Link>
          </div>
          <div className="mt-10 inline-flex items-center gap-3 bg-white border border-rose-200 rounded-full px-5 py-3 shadow-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-400"/>
            <span className="text-sm text-gray-500 font-mono">wishlink.com/<strong className="text-rose-500 font-sans">priya-birthday</strong></span>
          </div>
        </motion.div>
      </section>

      {/* Stats Banner */}
      <div className="bg-rose-500 py-6 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-around gap-6 text-center text-white">
          {[['50K+','Wishes Created'],['12 Lac+','Smiles Delivered'],['4.9 ⭐','Avg. Rating'],['180+','Countries']].map(([n,l]) => (
            <div key={l}><div className="font-display text-3xl font-black">{n}</div><div className="text-xs uppercase tracking-wider opacity-80">{l}</div></div>
          ))}
        </div>
      </div>

      {/* Occasions */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-rose-500 text-xs font-bold uppercase tracking-widest">Every Celebration</span>
            <h2 className="font-display text-4xl md:text-5xl font-black text-gray-900 mt-2">Made for Every <em className="text-rose-500">Special Moment</em></h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {OCCASIONS.map(o => (
              <motion.div key={o.name} whileHover={{ y:-6, scale:1.05 }} onClick={() => navigate('/create')}
                className={`rounded-2xl p-5 text-center cursor-pointer transition-all border-2 ${o.featured ? 'bg-gradient-to-br from-rose-500 to-rose-600 text-white border-transparent' : 'bg-white border-gray-100 hover:border-rose-200'}`}>
                <div className="text-3xl mb-2">{o.emoji}</div>
                <div className={`font-bold text-sm ${o.featured ? 'text-white' : 'text-gray-800'}`}>{o.name}</div>
                <div className={`text-xs mt-0.5 ${o.featured ? 'text-rose-100' : 'text-gray-400'}`}>{o.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4 mx-4">
        <div className="max-w-6xl mx-auto bg-gray-900 rounded-3xl p-12">
          <div className="text-center mb-12">
            <span className="text-rose-400 text-xs font-bold uppercase tracking-widest">Simple as 1, 2, 3</span>
            <h2 className="font-display text-4xl font-black text-white mt-2">How WishLink <em className="text-rose-400">Works</em></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { n:'01', icon:'🎯', title:'Choose Occasion', desc:'Pick from 13+ celebration types' },
              { n:'02', icon:'🎨', title:'Personalize', desc:'Upload photos, videos, add music & theme' },
              { n:'03', icon:'🪄', title:'AI Magic', desc:'Let AI write a heartfelt message' },
              { n:'04', icon:'🔗', title:'Share the Link', desc:'Get your custom URL & share anywhere' },
            ].map((s, i) => (
              <div key={s.n} className="text-center">
                <div className="w-14 h-14 rounded-full border-2 border-rose-500/30 bg-rose-500/10 flex items-center justify-center mx-auto mb-4 font-display text-xl font-black text-rose-400">{s.n}</div>
                <div className="text-3xl mb-3">{s.icon}</div>
                <div className="font-bold text-white text-base mb-2">{s.title}</div>
                <div className="text-gray-400 text-sm leading-relaxed">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Demo */}
      <section className="py-20 px-4 bg-gradient-to-br from-rose-50 to-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-rose-500 text-xs font-bold uppercase tracking-widest">Powered by AI</span>
            <h2 className="font-display text-4xl font-black text-gray-900 mt-2 mb-4">Write the <em className="text-rose-500">Perfect Message</em></h2>
            <p className="text-gray-600 leading-relaxed mb-6">No words? No problem. Our AI crafts heartfelt messages in seconds — in the language of your heart.</p>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3"><div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-lg">💌</div><div><div className="font-bold text-sm">AI Wish Generator</div><div className="text-xs text-gray-500">Emotional, personalized messages in seconds</div></div></div>
              <div className="flex items-center gap-3"><div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-lg">💕</div><div><div className="font-bold text-sm">Love Letter Writer</div><div className="text-xs text-gray-500">Pour your heart out — the AI finds the words</div></div></div>
              <div className="flex items-center gap-3"><div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-lg">🗣️</div><div><div className="font-bold text-sm">English • Hindi • Punjabi</div><div className="text-xs text-gray-500">Write in the language of your heart</div></div></div>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-rose-100">
            <div className="text-sm font-bold text-gray-700 mb-4">Try AI Message Generator</div>
            <div className="space-y-3 mb-4">
              <input value={aiForm.receiverName} onChange={e => setAiForm({...aiForm, receiverName:e.target.value})} placeholder="Receiver's name..." className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-400"/>
              <select value={aiForm.occasion} onChange={e => setAiForm({...aiForm, occasion:e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-400">
                {['birthday','anniversary','proposal','mother','graduation'].map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase()+o.slice(1)}</option>)}
              </select>
              <select value={aiForm.language} onChange={e => setAiForm({...aiForm, language:e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-400">
                <option value="english">English</option>
                <option value="hindi">Hindi</option>
                <option value="punjabi">Punjabi</option>
              </select>
              <button onClick={generateAI} disabled={aiLoading || !aiForm.receiverName} className="w-full bg-rose-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-rose-600 transition-colors disabled:opacity-50">
                {aiLoading ? '✨ Generating...' : '✨ Generate Message'}
              </button>
            </div>
            {aiMsg && <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 text-sm text-gray-700 font-display italic leading-relaxed">{aiMsg}</div>}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-rose-500 text-xs font-bold uppercase tracking-widest">Simple Pricing</span>
            <h2 className="font-display text-4xl font-black text-gray-900 mt-2">Choose Your <em className="text-rose-500">Plan</em></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {PRICING.map(p => (
              <div key={p.name} className={`relative rounded-3xl p-8 transition-all hover:-translate-y-1 ${p.popular ? 'bg-gradient-to-br from-plum-600 to-plum-800 text-white shadow-2xl shadow-plum-200' : 'bg-white border-2 border-gray-100 hover:border-rose-200 hover:shadow-lg'}`}>
                {p.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-black px-4 py-1.5 rounded-full">⭐ Most Popular</div>}
                <div className="text-3xl mb-3">{p.icon}</div>
                <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${p.popular ? 'text-white/60' : 'text-gray-400'}`}>{p.name}</div>
                <div className={`font-display text-4xl font-black mb-1 ${p.popular ? 'text-white' : 'text-gray-900'}`}>
                  {p.price === 0 ? 'Free' : <><span className="text-xl">₹</span>{p.price}</>}
                </div>
                <div className={`text-xs mb-6 ${p.popular ? 'text-white/60' : 'text-gray-400'}`}>{p.period}</div>
                <ul className="space-y-2.5 mb-8">
                  {p.features.map(f => (
                    <li key={f} className={`text-sm flex items-center gap-2 ${p.popular ? 'text-white/90' : 'text-gray-700'}`}>
                      <span className={p.popular ? 'text-yellow-300' : 'text-rose-500'}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className={`block text-center py-3 rounded-full text-sm font-bold transition-all ${p.popular ? 'bg-white text-plum-700 hover:bg-yellow-50' : 'border-2 border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white'}`}>
                  {p.price === 0 ? 'Get Started Free' : `Choose ${p.name}`}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-rose-500 text-xs font-bold uppercase tracking-widest">Real Love Stories</span>
            <h2 className="font-display text-4xl font-black text-gray-900 mt-2">They Made Someone <em className="text-rose-500">Cry Happy Tears</em></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="text-yellow-400 text-lg mb-3">{'★'.repeat(t.stars)}</div>
                <p className="font-display italic text-gray-800 leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center font-display font-black text-sm ${t.color}`}>{t.initials}</div>
                  <div><div className="font-bold text-sm text-gray-800">{t.name}</div><div className="text-xs text-gray-500">{t.loc}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-5xl font-black text-gray-900 mb-4">Make Someone Feel <em className="text-rose-500">Truly Loved</em> Today</h2>
          <p className="text-gray-600 text-lg mb-8">Your first wish is free. No credit card needed. Just pure love.</p>
          <Link to="/register" className="bg-rose-500 text-white px-10 py-4 rounded-full text-lg font-bold hover:bg-rose-600 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-200 inline-flex items-center gap-2">💝 Create Your Wish — It's Free</Link>
        </div>
      </section>

      <Footer/>
    </div>
  );
}
