import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Confetti from 'react-confetti';
import QRCode from 'react-qr-code';
import { wishAPI, commentAPI } from '../utils/api';
import toast from 'react-hot-toast';

const REACTIONS = ['❤️','😍','🥹','🎉','🎂','💐','🙏','🥰'];

export default function WishPage() {
  const { slug } = useParams();
  const [wish, setWish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentForm, setCommentForm] = useState({ guestName:'', guestEmail:'', content:'', emoji:'❤️' });
  const [secretPwd, setSecretPwd] = useState('');
  const [secretMsg, setSecretMsg] = useState('');
  const [secretError, setSecretError] = useState('');
  const [activeGalleryImg, setActiveGalleryImg] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const windowSize = { width: window.innerWidth, height: window.innerHeight };

  useEffect(() => {
    wishAPI.getPublic(slug)
      .then(r => {
        setWish(r.data.wish);
        if (r.data.wish.features?.showConfetti) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 6000);
        }
        return commentAPI.getAll(slug);
      })
      .then(r => setComments(r.data.comments))
      .catch(e => setError(e.response?.data?.message || 'Wish not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!wish?.countdownTo) return;
    const interval = setInterval(() => {
      const diff = new Date(wish.countdownTo) - new Date();
      if (diff <= 0) { clearInterval(interval); setTimeLeft(null); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ d, h, m, s });
    }, 1000);
    return () => clearInterval(interval);
  }, [wish]);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    try {
      const { data } = await commentAPI.add(slug, commentForm);
      setComments(c => [data.comment, ...c]);
      setCommentForm({ guestName:'', guestEmail:'', content:'', emoji:'❤️' });
      toast.success('Comment added! 💕');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add comment'); }
  };

  const unlockSecret = async () => {
    try {
      const { data } = await wishAPI.unlockSecret(slug, secretPwd);
      setSecretMsg(data.message);
      setSecretError('');
    } catch { setSecretError('Wrong password. Try again!'); }
  };

  const shareWishLink = (platform) => {
    const url = window.location.href;
    const text = `Check out this special wish page for ${wish.receiverName}! 💝`;
    const links = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    };
    if (links[platform]) window.open(links[platform], '_blank');
    else { navigator.clipboard.writeText(url); toast.success('Link copied!'); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-rose-50">
      <div className="text-center"><div className="text-5xl animate-bounce mb-4">💝</div><p className="text-rose-500">Loading your surprise...</p></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-rose-50">
      <div className="text-center bg-white rounded-3xl p-12 shadow-xl">
        <div className="text-5xl mb-4">😢</div>
        <h2 className="font-display text-2xl font-black mb-2 text-gray-800">Page Not Found</h2>
        <p className="text-gray-500">{error}</p>
      </div>
    </div>
  );

  const { theme, features } = wish;
  const heroStyle = {
    background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
    fontFamily: theme.fontFamily,
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: theme.fontFamily }}>
      {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={300} colors={[theme.primaryColor, theme.secondaryColor, '#FFD700', '#FF69B4']} />}

      {/* Audio */}
      {wish.music && <audio ref={audioRef} src={wish.music.url} loop/>}
      {wish.music && (
        <div className="fixed bottom-6 right-6 z-50">
          <button onClick={toggleAudio} className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white text-xl transition-all hover:scale-110" style={{ background: heroStyle.background }}>
            {playing ? '⏸' : '▶️'}
          </button>
        </div>
      )}

      {/* Hero */}
      <div className="relative overflow-hidden min-h-screen flex flex-col items-center justify-center text-center px-4 py-16" style={heroStyle}>
        <div className="absolute inset-0 opacity-20">
          {Array.from({length:20}).map((_,i) => <span key={i} className="absolute text-white text-2xl" style={{left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,opacity:Math.random()*.8}}>✨</span>)}
        </div>
        <div className="relative z-10 text-white">
          <div className="text-7xl mb-6 animate-bounce">💝</div>
          <h1 className="text-5xl md:text-7xl font-black mb-4 leading-tight" style={{ fontFamily: theme.fontFamily }}>
            Happy {wish.occasion.charAt(0).toUpperCase()+wish.occasion.slice(1).replace('_',' ')}!
          </h1>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 opacity-90">{wish.receiverName} 🌸</h2>
          <p className="text-lg opacity-75">With all the love from {wish.senderName}</p>
          {features.showVisitorCount && <p className="mt-4 text-sm opacity-60">👁️ {wish.visitCount} people have opened this page</p>}
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white opacity-60 text-sm animate-bounce">↓ Scroll down</div>
      </div>

      {/* Countdown */}
      {timeLeft && (
        <div className="bg-gray-900 py-8 px-4 text-white text-center">
          <p className="text-sm text-gray-400 uppercase tracking-widest mb-4">Counting down...</p>
          <div className="flex justify-center gap-6">
            {[['d','Days'],['h','Hours'],['m','Mins'],['s','Secs']].map(([k,l]) => (
              <div key={k} className="text-center"><div className="text-4xl font-black font-display">{String(timeLeft[k]).padStart(2,'0')}</div><div className="text-xs text-gray-400 mt-1">{l}</div></div>
            ))}
          </div>
        </div>
      )}

      {/* Message */}
      {wish.message && (
        <section className="py-20 px-4 max-w-3xl mx-auto text-center">
          <div className="text-4xl mb-6">💌</div>
          <h3 className="font-display text-3xl font-black text-gray-900 mb-8">A Message From the Heart</h3>
          <blockquote className="font-display text-xl md:text-2xl text-gray-700 italic leading-relaxed" style={{fontFamily:theme.fontFamily}}>
            "{wish.message}"
          </blockquote>
          <p className="mt-6 text-gray-500">— {wish.senderName}, with love</p>
        </section>
      )}

      {/* Photo Gallery */}
      {wish.images?.length > 0 && (
        <section className="py-16 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10"><div className="text-4xl mb-3">📸</div><h3 className="font-display text-3xl font-black text-gray-900">Our Beautiful Memories</h3></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {wish.images.map((img, i) => (
                <div key={i} onClick={() => setActiveGalleryImg(img.url)} className="cursor-pointer group overflow-hidden rounded-xl aspect-square">
                  <img src={img.url} alt={img.caption || `Memory ${i+1}`} className="w-full h-full object-cover transition-transform group-hover:scale-110"/>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lightbox */}
      {activeGalleryImg && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setActiveGalleryImg(null)}>
          <img src={activeGalleryImg} className="max-w-full max-h-full rounded-xl object-contain"/>
        </div>
      )}

      {/* Secret Message */}
      {wish.secretMessage?.content && (
        <section className="py-16 px-4 bg-gray-900">
          <div className="max-w-md mx-auto text-center">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="font-display text-2xl font-black text-white mb-2">Secret Message</h3>
            {!secretMsg ? (
              <>
                <p className="text-gray-400 text-sm mb-6">Enter the password to reveal the secret message</p>
                <input value={secretPwd} onChange={e => setSecretPwd(e.target.value)} type="password" placeholder="Enter password..." className="w-full bg-gray-800 text-white border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-500 mb-3"/>
                {secretError && <p className="text-red-400 text-xs mb-3">{secretError}</p>}
                <button onClick={unlockSecret} className="w-full bg-rose-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-rose-600">🔓 Unlock</button>
              </>
            ) : (
              <div className="bg-gray-800 rounded-xl p-6"><p className="text-white font-display italic text-lg leading-relaxed">"{secretMsg}"</p></div>
            )}
          </div>
        </section>
      )}

      {/* Share */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-md mx-auto">
          <h3 className="font-display text-2xl font-black text-gray-900 mb-2">Share This Page 🔗</h3>
          <p className="text-gray-500 text-sm mb-6">Spread the love with friends and family!</p>
          <div className="flex justify-center gap-3 flex-wrap">
            {[['📱 WhatsApp','whatsapp','bg-green-500'],['✈️ Telegram','telegram','bg-sky-500'],['📘 Facebook','facebook','bg-blue-600'],['🔗 Copy Link','copy','bg-gray-700']].map(([label, p, color]) => (
              <button key={p} onClick={() => shareWishLink(p)} className={`${color} text-white px-5 py-2.5 rounded-full text-sm font-bold hover:opacity-90 transition-opacity`}>{label}</button>
            ))}
          </div>
        </div>
      </section>

      {/* QR Code */}
      {features.showQRCode && (
        <section className="py-12 px-4 bg-white text-center">
          <div className="max-w-xs mx-auto">
            <h3 className="font-display text-xl font-black text-gray-900 mb-4">📱 Scan to Open</h3>
            <div className="inline-block bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
              <QRCode value={window.location.href} size={160}/>
            </div>
          </div>
        </section>
      )}

      {/* Comments */}
      {features.allowComments && (
        <section className="py-16 px-4 bg-rose-50">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10"><div className="text-4xl mb-3">💬</div><h3 className="font-display text-3xl font-black text-gray-900">Guest Book</h3><p className="text-gray-500 text-sm mt-2">Leave your love and wishes!</p></div>

            <form onSubmit={submitComment} className="bg-white rounded-2xl p-6 mb-8 shadow-sm border border-gray-100">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input value={commentForm.guestName} onChange={e => setCommentForm({...commentForm, guestName:e.target.value})} required placeholder="Your name" className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400"/>
                <input value={commentForm.guestEmail} onChange={e => setCommentForm({...commentForm, guestEmail:e.target.value})} placeholder="Email (optional)" type="email" className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400"/>
              </div>
              <textarea value={commentForm.content} onChange={e => setCommentForm({...commentForm, content:e.target.value})} required placeholder="Write your wishes..." rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400 resize-none mb-3"/>
              <div className="flex items-center justify-between">
                <div className="flex gap-2 flex-wrap">
                  {REACTIONS.map(r => <button key={r} type="button" onClick={() => setCommentForm({...commentForm, emoji:r})} className={`text-xl p-1 rounded-lg transition-all ${commentForm.emoji===r?'bg-rose-100 scale-125':''}`}>{r}</button>)}
                </div>
                <button type="submit" className="bg-rose-500 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-rose-600">Send 💕</button>
              </div>
            </form>

            <div className="space-y-4">
              {comments.map(c => (
                <div key={c._id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-sm">{c.guestName[0]?.toUpperCase()}</div>
                      <span className="font-semibold text-sm text-gray-800">{c.guestName}</span>
                      <span className="text-lg">{c.emoji}</span>
                    </div>
                    <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{c.content}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Watermark */}
      {wish.hasWatermark && (
        <div className="py-6 text-center bg-gray-100 text-gray-400 text-xs">
          Created with <a href="/" className="text-rose-500 font-semibold hover:underline">💝 WishLink</a> — Create your own free wish page!
        </div>
      )}
    </div>
  );
}
