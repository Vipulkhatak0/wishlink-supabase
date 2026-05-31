import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { wishAPI, uploadAPI, aiAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const OCCASIONS = ['birthday','anniversary','proposal','mother','father','friendship','valentine','graduation','baby_shower','farewell','festival','wedding','custom'];
const THEMES = ['gradient','solid','pattern','minimal'];
const FONTS = ['Playfair Display','DM Sans','Georgia','Times New Roman'];
const STEPS = ['Details','Occasion','Upload','Customize','Publish'];

export default function CreateWish() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  const [form, setForm] = useState({
    title:'', senderName: user?.name || '', receiverName:'', relationship:'',
    occasion:'birthday', customOccasion:'',
    message:'', aiGeneratedMessage:'',
    images:[], videos:[], music:null,
    theme:{ primaryColor:'#FF4D6D', secondaryColor:'#6B2D8B', fontFamily:'Playfair Display', backgroundStyle:'gradient' },
    features:{ showConfetti:true, showFireworks:false, showHeartRain:false, showCakeAnimation:false, allowComments:true, allowReactions:true, showVisitorCount:true, showQRCode:true },
    countdownTo:'', language:'english', isPublic:true,
    secretMessage:{ content:'', password:'' },
  });

  const update = (field, val) => setForm(f => ({ ...f, [field]: val }));
  const updateTheme = (k, v) => setForm(f => ({ ...f, theme: { ...f.theme, [k]: v } }));
  const updateFeature = (k, v) => setForm(f => ({ ...f, features: { ...f.features, [k]: v } }));

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const maxImages = user.plan === 'free' ? 5 : user.plan === 'silver' ? 20 : 999;
    if (form.images.length + files.length > maxImages) { toast.error(`Your plan allows max ${maxImages} images`); return; }
    setUploadingImg(true);
    for (const file of files) {
      try {
        const fd = new FormData(); fd.append('image', file);
        const { data } = await uploadAPI.image(fd);
        setForm(f => ({ ...f, images: [...f.images, { url: data.url, publicId: data.publicId, caption:'' }] }));
      } catch { toast.error(`Failed to upload ${file.name}`); }
    }
    setUploadingImg(false);
  };

  const handleAudioUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    if (!['silver','gold','platinum'].includes(user.plan)) { toast.error('Music upload requires Silver plan or higher'); return; }
    try {
      const fd = new FormData(); fd.append('audio', file);
      const { data } = await uploadAPI.audio(fd);
      update('music', { url: data.url, publicId: data.publicId, title: file.name });
      toast.success('Music uploaded!');
    } catch { toast.error('Failed to upload music'); }
  };

  const generateAI = async () => {
    if (!form.receiverName) { toast.error('Enter receiver name first'); return; }
    setAiLoading(true);
    try {
      const { data } = await aiAPI.generateMessage({ occasion: form.occasion, receiverName: form.receiverName, relationship: form.relationship, language: form.language });
      update('message', data.message);
      toast.success('AI message generated! ✨');
    } catch { toast.error('AI generation failed'); }
    finally { setAiLoading(false); }
  };

  const handleSubmit = async (publish = false) => {
    setLoading(true);
    try {
      const payload = { ...form, status: publish ? 'active' : 'draft' };
      const { data } = await wishAPI.create(payload);
      toast.success(publish ? '🎉 Wish published!' : 'Draft saved!');
      navigate(publish ? `/w/${data.wish.slug}` : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create wish');
    } finally { setLoading(false); }
  };

  const canNext = () => {
    if (step === 0) return form.senderName && form.receiverName && form.relationship;
    if (step === 1) return form.occasion;
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar/>
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i < step ? 'bg-green-500 text-white' : i === step ? 'bg-rose-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {i < step ? '✓' : i+1}
              </div>
              <span className={`text-sm font-medium ${i === step ? 'text-rose-600' : 'text-gray-400'}`}>{s}</span>
              {i < STEPS.length-1 && <div className={`w-8 h-0.5 ${i < step ? 'bg-green-400' : 'bg-gray-200'}`}/>}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          {/* Step 0: Details */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="font-display text-2xl font-black text-gray-900">Personal Details 👤</h2>
              {[
                { label:"Your Name (Sender)", key:'senderName', placeholder:'Arjun Kumar' },
                { label:"Receiver's Name", key:'receiverName', placeholder:'Priya Sharma' },
                { label:"Your Relationship", key:'relationship', placeholder:'Best Friend, Partner, Mom...' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">{f.label}</label>
                  <input value={form[f.key]} onChange={e => update(f.key, e.target.value)} placeholder={f.placeholder} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-400"/>
                </div>
              ))}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Page Title (Optional)</label>
                <input value={form.title} onChange={e => update('title', e.target.value)} placeholder={`${form.receiverName || 'Someone'}'s Special Day`} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-400"/>
              </div>
            </div>
          )}

          {/* Step 1: Occasion */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-display text-2xl font-black text-gray-900">Select Occasion 🎉</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {OCCASIONS.map(o => (
                  <button key={o} onClick={() => update('occasion', o)}
                    className={`p-3 rounded-xl text-center text-sm font-semibold capitalize transition-all border-2 ${form.occasion === o ? 'border-rose-500 bg-rose-50 text-rose-600' : 'border-gray-100 hover:border-rose-200 text-gray-700'}`}>
                    {o.replace('_',' ')}
                  </button>
                ))}
              </div>
              {form.occasion === 'custom' && (
                <input value={form.customOccasion} onChange={e => update('customOccasion', e.target.value)} placeholder="Describe your occasion..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-400"/>
              )}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Language</label>
                <select value={form.language} onChange={e => update('language', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-400">
                  <option value="english">English</option>
                  <option value="hindi">Hindi</option>
                  <option value="punjabi">Punjabi</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Upload */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-black text-gray-900">Upload Media 📸</h2>

              {/* Images */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Photos ({form.images.length}/{user.plan === 'free' ? 5 : user.plan === 'silver' ? 20 : '∞'})</label>
                <label className="block border-2 border-dashed border-rose-200 rounded-xl p-6 text-center cursor-pointer hover:bg-rose-50 transition-colors">
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden"/>
                  <div className="text-3xl mb-2">🖼️</div>
                  <div className="text-sm text-gray-500">{uploadingImg ? 'Uploading...' : 'Click to upload photos'}</div>
                </label>
                {form.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {form.images.map((img, i) => (
                      <div key={i} className="relative group">
                        <img src={img.url} className="w-full aspect-square object-cover rounded-lg"/>
                        <button onClick={() => setForm(f => ({...f, images: f.images.filter((_,j)=>j!==i)}))} className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Music */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Background Music {user.plan === 'free' && <span className="text-xs text-rose-400">(Silver+ required)</span>}</label>
                <label className={`block border-2 border-dashed rounded-xl p-6 text-center transition-colors ${user.plan === 'free' ? 'border-gray-200 opacity-50 cursor-not-allowed' : 'border-rose-200 cursor-pointer hover:bg-rose-50'}`}>
                  <input type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" disabled={user.plan === 'free'}/>
                  <div className="text-3xl mb-2">🎵</div>
                  <div className="text-sm text-gray-500">{form.music ? `✅ ${form.music.title}` : 'Click to upload music'}</div>
                </label>
              </div>

              {/* Message */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700">Your Message 💌</label>
                  <button onClick={generateAI} disabled={aiLoading} className="text-xs bg-plum-100 text-purple-600 px-3 py-1.5 rounded-full font-bold hover:bg-purple-100 transition-colors disabled:opacity-50">
                    {aiLoading ? '✨ Generating...' : '✨ Generate with AI'}
                  </button>
                </div>
                <textarea value={form.message} onChange={e => update('message', e.target.value)} rows={5} placeholder="Write your heartfelt message here..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-400 resize-none"/>
              </div>
            </div>
          )}

          {/* Step 3: Customize */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-black text-gray-900">Customize 🎨</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={form.theme.primaryColor} onChange={e => updateTheme('primaryColor', e.target.value)} className="w-12 h-10 rounded-lg cursor-pointer border border-gray-200"/>
                    <span className="text-sm text-gray-500">{form.theme.primaryColor}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Secondary Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={form.theme.secondaryColor} onChange={e => updateTheme('secondaryColor', e.target.value)} className="w-12 h-10 rounded-lg cursor-pointer border border-gray-200"/>
                    <span className="text-sm text-gray-500">{form.theme.secondaryColor}</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Font</label>
                <select value={form.theme.fontFamily} onChange={e => updateTheme('fontFamily', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-400">
                  {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 block">Effects & Features</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key:'showConfetti', label:'🎊 Confetti' },
                    { key:'showFireworks', label:'🎆 Fireworks' },
                    { key:'showHeartRain', label:'💕 Heart Rain' },
                    { key:'showCakeAnimation', label:'🎂 Cake Animation' },
                    { key:'allowComments', label:'💬 Guest Comments' },
                    { key:'allowReactions', label:'😊 Emoji Reactions' },
                    { key:'showVisitorCount', label:'👁️ Visitor Count' },
                    { key:'showQRCode', label:'📱 QR Code' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.features[key]} onChange={e => updateFeature(key, e.target.checked)} className="accent-rose-500 w-4 h-4"/>
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              {['gold','platinum'].includes(user.plan) && (
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">⏰ Countdown Timer (Optional)</label>
                  <input type="datetime-local" value={form.countdownTo} onChange={e => update('countdownTo', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-400"/>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Publish */}
          {step === 4 && (
            <div className="text-center py-6 space-y-6">
              <div className="text-6xl">🚀</div>
              <h2 className="font-display text-2xl font-black text-gray-900">Ready to Publish!</h2>
              <p className="text-gray-500 text-sm max-w-sm mx-auto">Your wish page is ready. Publish it to get a shareable link, or save as draft to edit later.</p>
              <div className="bg-rose-50 rounded-xl p-4 text-sm text-gray-700">
                <span className="font-semibold">Your link will be: </span>
                <span className="text-rose-500 font-mono">wishlink.com/w/{form.receiverName.toLowerCase().replace(/\s+/g,'-') || 'your-name'}-{form.occasion}</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={() => handleSubmit(false)} disabled={loading} className="px-8 py-3 border-2 border-gray-300 rounded-full font-bold text-sm text-gray-700 hover:border-gray-400 disabled:opacity-50">Save as Draft</button>
                <button onClick={() => handleSubmit(true)} disabled={loading} className="px-8 py-3 bg-rose-500 text-white rounded-full font-bold text-sm hover:bg-rose-600 disabled:opacity-50">
                  {loading ? '🎉 Publishing...' : '🎉 Publish Now!'}
                </button>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          {step < 4 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              <button onClick={() => setStep(s => s-1)} disabled={step === 0} className="px-6 py-3 border-2 border-gray-200 rounded-full font-bold text-sm text-gray-600 hover:border-gray-300 disabled:opacity-30 transition-all">← Back</button>
              <button onClick={() => setStep(s => s+1)} disabled={!canNext()} className="px-8 py-3 bg-rose-500 text-white rounded-full font-bold text-sm hover:bg-rose-600 disabled:opacity-40 transition-all">Next →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
