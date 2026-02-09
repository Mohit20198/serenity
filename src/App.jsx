import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { 
  Activity, ArrowRight, HeartPulse, Lightbulb, Shield, BookOpen, 
  Send, Mic, MoreVertical, ArrowLeft, Flower2, Frown, Meh, Smile, Laugh,
  Mail, Lock, User, Loader2, Bell, Play, Wind, Waves, Trees, CheckCircle,
  BarChart3, Calendar, Heart, CloudRain, Music, Phone, X, PenTool, Flame, Video
} from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

import VideoTherapy from './VideoTherapy';

// ==========================================
// 1. HELPER COMPONENTS
// ==========================================

const FeatureCard = ({ icon, title, desc }) => (
  <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-auraPurple/30 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 group">
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-auraGreen/20 to-auraPurple/20 flex items-center justify-center text-auraGreen group-hover:text-auraPurple transition-colors mb-4">{icon}</div>
    <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

const StatCard = ({ label, value, sub, icon }) => (
  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition">
     <div className="flex justify-between items-start mb-2"><span className="text-gray-400 text-xs font-medium">{label}</span>{icon}</div>
     <div className="text-2xl font-bold mb-1">{value}</div>
     <div className="text-xs text-gray-500">{sub}</div>
  </div>
);

const ActivityCard = ({ title, time, icon, color }) => (
  <div className="group p-5 bg-white/5 border border-white/10 rounded-2xl hover:border-auraGreen/50 hover:bg-white/10 transition cursor-pointer flex items-center gap-4">
     <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${color} group-hover:scale-110 transition-transform`}>{icon}</div>
     <div><h3 className="font-bold text-sm group-hover:text-auraGreen transition-colors">{title}</h3><p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Play size={10} /> {time}</p></div>
  </div>
);

// ==========================================
// 2. MODALS
// ==========================================

const BreathingModal = ({ onClose }) => {
  const [phase, setPhase] = useState('Inhale'); 
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const breathe = () => {
      setPhase('Inhale'); setScale(1.5);
      setTimeout(() => {
        setPhase('Hold');
        setTimeout(() => { setPhase('Exhale'); setScale(1); }, 2000); 
      }, 4000); 
    };
    breathe();
    const interval = setInterval(breathe, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-8 w-full max-w-md flex flex-col items-center relative overflow-hidden">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
        <h2 className="text-2xl font-bold mb-8 text-center">Box Breathing</h2>
        <div className="relative w-64 h-64 flex items-center justify-center mb-12">
           <div className="absolute w-40 h-40 bg-auraGreen/20 rounded-full transition-all duration-[4000ms] ease-in-out blur-xl" style={{ transform: `scale(${scale})` }} />
           <div className="absolute w-40 h-40 border-4 border-auraGreen/50 rounded-full transition-all duration-[4000ms] ease-in-out flex items-center justify-center z-10" style={{ transform: `scale(${scale})` }}>
             <span className="text-xl font-bold text-white tracking-widest uppercase">{phase}</span>
           </div>
        </div>
        <p className="text-gray-400 text-center text-sm">Focus on your breath. Let go of tension.</p>
      </div>
    </div>
  );
};

const JournalModal = ({ onClose }) => {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [tag, setTag] = useState(null);

  const handleSave = () => {
    setIsAnalyzing(true);
    setTimeout(() => { setIsAnalyzing(false); setTag(text.length > 20 ? 'Growth' : 'Reflection'); }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-6 w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><PenTool size={20} className="text-auraPurple"/> Daily Journal</h2>
        {!tag ? (
          <>
            <textarea className="w-full h-40 bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-auraPurple/50 mb-4 resize-none" placeholder="Write your thoughts..." value={text} onChange={(e) => setText(e.target.value)} />
            <button onClick={handleSave} disabled={!text || isAnalyzing} className="w-full py-3 bg-gradient-to-r from-auraPurple to-blue-600 rounded-xl font-bold flex items-center justify-center gap-2">
              {isAnalyzing ? <Loader2 className="animate-spin" /> : 'Save & Analyze'}
            </button>
          </>
        ) : (
          <div className="text-center py-8">
            <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Entry Saved</h3>
            <span className="px-4 py-2 bg-auraPurple/20 text-auraPurple rounded-full text-sm font-bold">#{tag}</span>
            <button onClick={onClose} className="block w-full mt-8 text-gray-400 hover:text-white">Close</button>
          </div>
        )}
      </div>
    </div>
  );
};

const CrisisModal = ({ onClose }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-red-900/90 backdrop-blur-md p-4">
    <div className="bg-white text-black rounded-3xl p-8 w-full max-w-md text-center shadow-2xl relative">
       <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black"><X size={24} /></button>
       <Phone size={48} className="text-red-600 mx-auto mb-4" />
       <h2 className="text-2xl font-bold mb-2">Help is available</h2>
       <div className="space-y-3 mt-6">
         <a href="tel:988" className="block w-full py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition">Call 988 (Crisis Lifeline)</a>
         <a href="tel:112" className="block w-full py-4 bg-gray-200 text-black rounded-xl font-bold hover:bg-gray-300 transition">Emergency (112/911)</a>
       </div>
    </div>
  </div>
);

// ==========================================
// 3. MAIN PAGES
// ==========================================

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeMood, setActiveMood] = useState('Peaceful');
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const moods = [
    { label: 'Down', icon: <Frown size={24} /> },
    { label: 'Content', icon: <Meh size={24} /> },
    { label: 'Peaceful', icon: <Flower2 size={24} /> },
    { label: 'Happy', icon: <Smile size={24} /> },
    { label: 'Excited', icon: <Laugh size={24} /> },
  ];

  useEffect(() => {
    const handleMouseMove = (event) => setMousePos({ x: event.clientX, y: event.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const calculateMood = (clientX) => {
    if (!sliderRef.current) return;
    const { left, width } = sliderRef.current.getBoundingClientRect();
    let percent = (clientX - left) / width;
    percent = Math.max(0, Math.min(1, percent));
    const index = Math.round(percent * (moods.length - 1));
    setActiveMood(moods[index].label);
  };

  const handleStart = (e) => { setIsDragging(true); calculateMood(e.clientX || e.touches[0].clientX); };

  useEffect(() => {
    const handleMove = (e) => { if (isDragging) calculateMood(e.clientX || (e.touches ? e.touches[0].clientX : 0)); };
    const handleEnd = () => setIsDragging(false);
    if (isDragging) {
      window.addEventListener('mousemove', handleMove); window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove); window.addEventListener('touchend', handleEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove); window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging]);

  const activeIndex = moods.findIndex(m => m.label === activeMood);
  const positionPercent = (activeIndex / (moods.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-auraBlack text-white overflow-hidden relative font-sans selection:bg-auraGreen/30">
      <div className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300" style={{ background: `radial-gradient(600px at ${mousePos.x}px ${mousePos.y}px, rgba(167, 139, 250, 0.15), transparent 80%)` }} />
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-96 h-96 bg-auraGreen/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob" />
        <div className="absolute top-[20%] right-[20%] w-96 h-96 bg-auraPurple/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000" />
      </div>

      <nav className="relative z-10 flex justify-between items-center px-8 py-6 max-w-7xl mx-auto backdrop-blur-sm">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="p-2 bg-gradient-to-tr from-auraGreen to-auraPurple rounded-lg group-hover:rotate-12 transition-transform">
            <Activity className="text-black" size={24} />
          </div>
          <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Serenity</span>
        </div>
        <button onClick={() => navigate('/auth')} className="px-6 py-2 rounded-full text-sm font-medium border border-white/10 bg-white/5 hover:bg-white/10 hover:border-auraPurple/50 hover:text-auraPurple transition-all duration-300">Sign In</button>
      </nav>

      <main className="relative z-10 flex flex-col items-center mt-20 px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-sm font-medium mb-8 animate-fade-in-up">
          <span className="w-2 h-2 rounded-full bg-auraGreen animate-pulse"/>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-auraGreen to-auraPurple">Your AI Mental Health Companion</span>
        </div>
        <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight">
          Find Your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-auraGreen via-white to-auraPurple animate-gradient-x">Inner Balance</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl leading-relaxed mb-12">Experience a new way of emotional support. Our AI companion is here to listen, understand, and guide you through life's journey.</p>
        
        <div className="w-full max-w-2xl mb-16 relative p-8 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm">
           <div className="flex justify-between items-end px-2 mb-6 relative z-10 pointer-events-none">
            {moods.map((m) => {
              const isActive = activeMood === m.label;
              return (
                <div key={m.label} className={`flex flex-col items-center gap-3 transition-all duration-300 ${isActive ? 'text-auraGreen -translate-y-2 scale-110' : 'text-gray-600'}`}>
                  <div>{m.icon}</div>
                  <span className="text-xs font-medium">{m.label}</span>
                </div>
              );
            })}
           </div>
           <div ref={sliderRef} onMouseDown={(e) => {setIsDragging(true); calculateMood(e.clientX)}} onTouchStart={handleStart} className="relative w-full h-2 bg-white/10 rounded-full cursor-pointer">
              <div className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-gradient-to-r from-auraGreen to-auraPurple rounded-full shadow-[0_0_20px_rgba(167,139,250,0.5)]" style={{ left: `${positionPercent}%`, transform: 'translate(-50%, -50%)' }}>
                 <div className="absolute inset-0 bg-white rounded-full opacity-30 animate-ping"/>
              </div>
           </div>
        </div>

        <button onClick={() => navigate('/auth')} className="group relative px-8 py-4 bg-white text-black font-bold text-lg rounded-full overflow-hidden transition-transform hover:scale-105">
           <div className="absolute inset-0 bg-gradient-to-r from-auraGreen to-auraPurple opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
           <span className="relative z-10 group-hover:text-white transition-colors flex items-center gap-2">Begin Journey <ArrowRight size={20} /></span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-7xl w-full mt-32 px-4 pb-20">
          <FeatureCard icon={<HeartPulse />} title="24/7 Support" desc="Always here to listen." />
          <FeatureCard icon={<Lightbulb />} title="Smart Insights" desc="Personalized guidance." />
          <FeatureCard icon={<Shield />} title="Private & Secure" desc="Conversations are confidential." />
          <FeatureCard icon={<BookOpen />} title="Evidence-Based" desc="Backed by clinical research." />
        </div>
      </main>
    </div>
  );
};

// --- AUTH PAGE (WITH GOOGLE) ---
const AuthPage = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Standard Form State
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Standard Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const endpoint = isSignUp ? 'api/signup' : 'api/login';
    const payload = isSignUp 
      ? { full_name: formData.fullName, email: formData.email, password: formData.password }
      : { email: formData.email, password: formData.password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Authentication failed');
      
      if(data.user) localStorage.setItem('userName', data.user);
      setTimeout(() => { setLoading(false); navigate('/dashboard'); }, 500);
    } catch (err) { setLoading(false); setError(err.message); }
  };

  // --- GOOGLE SUCCESS HANDLER ---
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const response = await fetch('api/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential })
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.detail || 'Google Login failed');

      localStorage.setItem('userName', data.user);
      navigate('/dashboard');
    } catch (err) {
      setError("Google Login Failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-auraBlack text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-auraGreen/20 rounded-full blur-[120px] pointer-events-none animate-blob" />
      
      <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10 backdrop-blur-xl">
        <h2 className="text-2xl font-bold mb-2 text-center">{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
        <p className="text-gray-400 text-sm text-center mb-6">{isSignUp ? 'Start your journey to peace.' : 'Continue where you left off.'}</p>
        
        {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm text-center">{error}</div>}

        {/* GOOGLE LOGIN BUTTON */}
        <div className="flex justify-center mb-6">
           <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google Login Failed")}
              theme="filled_black"
              shape="pill"
           />
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-[#0A0A0A] text-gray-500">Or continue with email</span></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400">Full Name</label>
              <input name="fullName" value={formData.fullName} onChange={handleChange} type="text" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-auraGreen outline-none" required />
            </div>
          )}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400">Email Address</label>
            <input name="email" value={formData.email} onChange={handleChange} type="email" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-auraGreen outline-none" required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400">Password</label>
            <input name="password" value={formData.password} onChange={handleChange} type="password" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-auraGreen outline-none" required />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-auraGreen to-auraPurple text-black font-bold py-3.5 rounded-xl flex justify-center hover:scale-[1.02] transition-transform">
            {loading ? <Loader2 className="animate-spin" /> : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
           {isSignUp ? "Already have an account? " : "Don't have an account? "}
           <button onClick={() => { setIsSignUp(!isSignUp); setError(''); }} className="text-auraGreen hover:underline font-medium">
             {isSignUp ? 'Sign In' : 'Sign Up'}
           </button>
        </p>
      </div>
      <button onClick={() => navigate('/')} className="absolute bottom-8 text-gray-500 hover:text-white flex items-center gap-2"><ArrowLeft size={16} /> Back to Home</button>
    </div>
  );
};

// --- DASHBOARD (FIXED ALIGNMENT) ---
const Dashboard = () => {
  const navigate = useNavigate();
  const [showBreathing, setShowBreathing] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [showCrisis, setShowCrisis] = useState(false);
  const [activeAmbience, setActiveAmbience] = useState(null);
  
  // Real Data State
  const [moodHistory, setMoodHistory] = useState([]);
  const [avgMood, setAvgMood] = useState("0.0");
  const audioRef = useRef(new Audio());

  // Fetch Real Data
  useEffect(() => {
    const fetchMoods = async () => {
      try {
        const res = await fetch('api/mood-history');
        if (res.ok) {
          const data = await res.json();
          const chartData = data.map(entry => ((entry.score + 1) / 2) * 90 + 10);
          setMoodHistory(chartData);
          if (data.length > 0) {
            const total = data.reduce((acc, curr) => acc + curr.score, 0);
            const score = ((total / data.length + 1) / 2) * 10;
            setAvgMood(score.toFixed(1));
          }
        }
      } catch (err) {
        console.log("Backend offline or error");
      }
    };
    fetchMoods();
    const interval = setInterval(fetchMoods, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleAmbience = (type) => {
    if (activeAmbience === type) {
      audioRef.current.pause();
      setActiveAmbience(null);
    } else {
      const sounds = {
        'Rain': 'https://assets.mixkit.co/active_storage/sfx/2515/2515-preview.mp3',
        'Forest': 'https://assets.mixkit.co/active_storage/sfx/2436/2436-preview.mp3',
        'Waves': 'https://assets.mixkit.co/active_storage/sfx/2065/2065-preview.mp3'
      };
      audioRef.current.src = sounds[type];
      audioRef.current.loop = true;
      audioRef.current.play().catch(e => console.log("Audio play failed:", e));
      setActiveAmbience(type);
    }
  };

  useEffect(() => { return () => { audioRef.current.pause(); }; }, []);

  return (
    <div className="min-h-screen bg-auraBlack text-white p-6 relative font-sans overflow-x-hidden selection:bg-auraGreen/30">
       {showBreathing && <BreathingModal onClose={() => setShowBreathing(false)} />}
       {showJournal && <JournalModal onClose={() => setShowJournal(false)} />}
       {showCrisis && <CrisisModal onClose={() => setShowCrisis(false)} />}

       <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-auraGreen/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-auraPurple/10 rounded-full blur-[120px]" />
       </div>

       <header className="relative z-10 flex justify-between items-center mb-8 max-w-7xl mx-auto">
          <div><h1 className="text-3xl font-bold mb-1">Welcome back, Mohit</h1><p className="text-gray-400 text-sm">Your safe space is ready.</p></div>
          <div className="flex gap-4">
             <button onClick={() => navigate('/video-session')} className="px-4 py-2 text-sm font-bold text-auraGreen border border-auraGreen/30 rounded-full hover:bg-auraGreen/10 transition flex items-center gap-2">
               <Video size={14} /> Video Mode
             </button>
             <button onClick={() => setShowCrisis(true)} className="px-4 py-2 text-sm font-bold text-red-400 border border-red-500/30 rounded-full hover:bg-red-500/10 transition flex items-center gap-2"><Phone size={14} /> SOS</button>
             <button onClick={() => navigate('/')} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition">Sign Out</button>
          </div>
       </header>

       {/* --- TOP SECTION (Split Layout) --- */}
       <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          <div className="lg:col-span-1 space-y-6">
             <div className="p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm">
                <h2 className="text-lg font-bold flex items-center gap-2 mb-4"><Activity size={18} className="text-auraGreen"/> Quick Actions</h2>
                <button onClick={() => navigate('/chat')} className="w-full py-4 bg-gradient-to-r from-auraGreen to-green-600 rounded-xl text-black font-bold mb-4 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 shadow-lg shadow-green-900/20"><Play size={20} fill="black" /> Start Therapy</button>
                <div className="grid grid-cols-2 gap-3">
                   <div onClick={() => setShowJournal(true)} className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-auraPurple/50 transition cursor-pointer flex flex-col items-center gap-2 text-center group"><PenTool className="text-gray-400 group-hover:text-auraPurple transition-colors" /><span className="text-sm font-medium">Journal</span></div>
                   <div onClick={() => setShowBreathing(true)} className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-blue-400/50 transition cursor-pointer flex flex-col items-center gap-2 text-center group"><Wind className="text-gray-400 group-hover:text-blue-400 transition-colors" /><span className="text-sm font-medium">Breathe</span></div>
                </div>
             </div>

             <div className="p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm">
                <h2 className="text-lg font-bold flex items-center gap-2 mb-4"><Music size={18} className="text-blue-400"/> Soundscapes</h2>
                <div className="flex justify-between gap-2">
                   {['Rain', 'Forest', 'Waves'].map((sound) => (
                     <button key={sound} onClick={() => toggleAmbience(sound)} className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all flex flex-col items-center gap-1 ${activeAmbience === sound ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                       {sound === 'Rain' && <CloudRain size={18} />} {sound === 'Forest' && <Trees size={18} />} {sound === 'Waves' && <Waves size={18} />} {activeAmbience === sound ? 'Playing' : sound}
                     </button>
                   ))}
                </div>
             </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <StatCard label="Mood Score" value={avgMood} sub="AI Analysis (0-10)" icon={<HeartPulse size={20} className="text-auraPurple"/>} />
                 <StatCard label="Streak" value="5 Days" sub="Keep it up!" icon={<Flame size={20} className="text-orange-400"/>} />
                 <StatCard label="Journal" value="12" sub="Total Entries" icon={<BookOpen size={20} className="text-blue-400"/>} />
             </div>

             <div className="p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm h-64 flex flex-col">
                <div className="flex justify-between items-center mb-6"><h2 className="text-lg font-bold flex items-center gap-2"><BarChart3 size={18} className="text-auraGreen"/> Weekly Mood</h2></div>
                <div className="flex-1 flex items-end justify-between gap-4 px-2">
                   {moodHistory.length > 0 ? moodHistory.map((h, i) => (
                     <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                        <div className="w-full bg-white/10 rounded-t-lg relative overflow-hidden group-hover:bg-white/20 transition-all duration-500" style={{ height: `${h}%` }}>
                          <div className="absolute bottom-0 left-0 w-full h-1 bg-auraGreen shadow-[0_0_10px_#4ADE80]"></div>
                        </div>
                        <span className="text-xs text-gray-500">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
                     </div>
                   )) : <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">Start chatting to see analytics</div>}
                </div>
             </div>
          </div>
       </div>

       {/* --- BOTTOM SECTION (Recommended for You - FIXED ALIGNMENT) --- */}
       <div className="max-w-7xl mx-auto mt-8 relative z-10 pb-20">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4"><Wind size={18} className="text-blue-400"/> Recommended for You</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div onClick={() => setShowBreathing(true)}><ActivityCard title="Box Breathing" time="5 mins" icon={<Wind />} color="bg-blue-500/20" /></div>
              <ActivityCard title="Zen Garden" time="10 mins" icon={<Flower2 />} color="bg-pink-500/20" />
              <ActivityCard title="Mindful Forest" time="15 mins" icon={<Trees />} color="bg-green-500/20" />
              <ActivityCard title="Ocean Waves" time="8 mins" icon={<Waves />} color="bg-cyan-500/20" />
          </div>
       </div>
    </div>
  );
};


const ChatInterface = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([{ id: 1, text: "Hello. I am Aura. I'm here to listen. How are you feeling?", sender: 'bot' }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input;
    setMessages(prev => [...prev, { id: Date.now(), text: userText, sender: 'user' }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_input: userText })
      });
      if (!response.ok) throw new Error("Backend not connected");
      const data = await response.json();
      setMessages(prev => [...prev, { id: Date.now()+1, text: data.response, sender: 'bot' }]);
    } catch (err) {
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now()+1, text: "I can't reach my brain right now! Make sure you ran 'uvicorn main:app --reload' in the backend folder.", sender: 'bot' }]);
      }, 1000);
    } finally { setIsTyping(false); }
  };

  return (
    <div className="min-h-screen bg-auraBlack flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="w-full max-w-4xl h-[85vh] bg-[#0A0A0A] rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden relative">
        <header className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0A0A0A] z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition"><ArrowLeft size={20} /></button>
            <h2 className="text-white font-bold text-lg">Serenity Companion</h2>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] p-4 rounded-2xl text-sm md:text-base leading-relaxed ${msg.sender === 'user' ? 'bg-gradient-to-r from-auraGreen to-auraPurple text-black font-medium rounded-tr-none' : 'bg-white/5 text-gray-200 border border-white/5 rounded-tl-none'}`}>{msg.text}</div>
            </div>
          ))}
          {isTyping && <div className="flex justify-start"><div className="bg-white/5 px-4 py-3 rounded-2xl text-gray-400 text-sm">Typing...</div></div>}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 md:p-6 bg-[#0A0A0A] border-t border-white/5">
          <div className="relative flex items-center bg-white/5 rounded-full border border-white/10 focus-within:border-auraPurple/50 transition-colors">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Type your thoughts..." className="flex-1 bg-transparent border-none text-white placeholder-gray-500 px-6 py-4 focus:outline-none" />
            <div className="flex items-center gap-2 pr-4">
              <button onClick={handleSend} className="p-3 rounded-full bg-auraGreen text-black hover:scale-105"><Send size={18} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN ROUTER ---
export default function App() {
  const GOOGLE_CLIENT_ID = "601971777704-mgda14dlttkrs0h0jl6l0chmn6sbcbrp.apps.googleusercontent.com"; // <--- PASTE YOUR CLIENT ID HERE

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router basename="/aura-web">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<ChatInterface />} />
          <Route path="/video-session" element={<VideoTherapy />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}