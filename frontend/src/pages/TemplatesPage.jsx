import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const TEMPLATES = [
  { id:1, name:'Romantic Proposal', occasion:'proposal', emoji:'💍', gradient:'from-rose-500 to-pink-600', plan:'free', desc:'Perfect for the most important question of your life' },
  { id:2, name:'Birthday Party', occasion:'birthday', emoji:'🎂', gradient:'from-yellow-400 to-orange-500', plan:'free', desc:'Celebrate their special day with confetti & joy' },
  { id:3, name:'Anniversary', occasion:'anniversary', emoji:'💑', gradient:'from-purple-600 to-rose-500', plan:'silver', desc:'Relive every beautiful memory together' },
  { id:4, name:'Mother Love', occasion:'mother', emoji:'👩‍👧', gradient:'from-pink-400 to-rose-500', plan:'silver', desc:'Show mom just how much she means to you' },
  { id:5, name:'Father Hero', occasion:'father', emoji:'👨‍👦', gradient:'from-blue-600 to-blue-400', plan:'free', desc:'Celebrate the strongest person you know' },
  { id:6, name:'Friendship Forever', occasion:'friendship', emoji:'🤝', gradient:'from-green-500 to-teal-400', plan:'free', desc:'Celebrate the bond that never breaks' },
  { id:7, name:'Festival Wishes', occasion:'festival', emoji:'🪔', gradient:'from-orange-500 to-yellow-400', plan:'gold', desc:'Diwali, Eid, Christmas — spread the festive cheer' },
  { id:8, name:'Graduation Glory', occasion:'graduation', emoji:'🎓', gradient:'from-indigo-600 to-purple-500', plan:'gold', desc:'Celebrate the hard work that paid off' },
];

const PLAN_BADGE = { free:'🆓 Free', silver:'🥈 Silver+', gold:'🥇 Gold+', platinum:'💎 Platinum' };

export default function TemplatesPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? TEMPLATES : TEMPLATES.filter(t => t.plan === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar/>
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="font-display text-5xl font-black text-gray-900 mb-4">Choose Your <em className="text-rose-500">Template</em></h1>
          <p className="text-gray-500 text-lg">Ready-made templates with animations, music & unique themes.</p>
        </div>
        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          {['all','free','silver','gold'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-5 py-2.5 rounded-full text-sm font-bold capitalize transition-all ${filter===f ? 'bg-rose-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-rose-300'}`}>{f === 'all' ? 'All Templates' : PLAN_BADGE[f]}</button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map(t => (
            <div key={t.id} className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-2 cursor-pointer" onClick={() => navigate('/create')}>
              <div className={`h-52 bg-gradient-to-br ${t.gradient} flex flex-col items-center justify-center text-white p-6 text-center relative`}>
                <div className="text-5xl mb-3">{t.emoji}</div>
                <div className="font-display font-bold text-xl">{t.name}</div>
                <div className="absolute top-3 right-3 bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-full">{PLAN_BADGE[t.plan]}</div>
              </div>
              <div className="p-5">
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">{t.desc}</p>
                <button className="w-full py-2.5 border-2 border-rose-200 text-rose-500 rounded-xl text-sm font-bold hover:bg-rose-500 hover:text-white transition-all group-hover:bg-rose-500 group-hover:text-white">Use Template</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer/>
    </div>
  );
}
