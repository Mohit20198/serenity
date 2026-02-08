import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link } from 'react-router-dom';
import { 
  Activity, ArrowRight, HeartPulse, Lightbulb, Shield, BookOpen, 
  Send, Mic, MoreVertical, ArrowLeft, Flower2, Frown, Meh, Smile, Laugh,
  Mail, Lock, User, Loader2
} from 'lucide-react';

// --- LANDING PAGE COMPONENT ---
const LandingPage = () => {
  const navigate = useNavigate();
  const [activeMood, setActiveMood] = useState('Peaceful');
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef(null);

  const moods = [
    { label: 'Down', icon: <Frown size={24} /> },
    { label: 'Content', icon: <Meh size={24} /> },
    { label: 'Peaceful', icon: <Flower2 size={24} /> },
    { label: 'Happy', icon: <Smile size={24} /> },
    { label: 'Excited', icon: <Laugh size={24} /> },
  ];

  const calculateMood = (clientX) => {
    if (!sliderRef.current) return;
    const { left, width } = sliderRef.current.getBoundingClientRect();
    let percent = (clientX - left) / width;
    percent = Math.max(0, Math.min(1, percent));
    const index = Math.round(percent * (moods.length - 1));
    setActiveMood(moods[index].label);
  };

  const handleStart = (e) => {
    setIsDragging(true);
    const clientX = e.clientX || e.touches[0].clientX;
    calculateMood(clientX);
  };

  useEffect(() => {
    const handleMove = (e) => {
      if (!isDragging) return;
      const clientX = e.clientX || (e.touches ? e.touches[0].clientX : 0);
      calculateMood(clientX);
    };
    
    const handleEnd = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging]);

  const activeIndex = moods.findIndex(m => m.label === activeMood);
  const positionPercent = (activeIndex / (moods.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-auraBlack text-white overflow-hidden relative font-sans select-none">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-auraGreen/20 rounded-full blur-[120px] pointer-events-none" />
      
      <nav className="relative z-10 flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Activity className="text-auraGreen" size={28} />
          <span className="text-xl font-bold tracking-tight">Aura3.0</span>
        </div>
        <button
  onClick={() => navigate('/auth')}
  className="
    relative group px-6 py-2 rounded-full text-sm font-medium
    bg-white/5 text-gray-200 border border-white/10 overflow-hidden
    transition-all duration-300 ease-out
    hover:text-auraGreen hover:border-auraGreen/50 hover:shadow-[0_0_20px_rgba(74,222,128,0.3)] hover:scale-105
    active:scale-95
  "
>
  {/* Subtle background gradient overlay on hover */}
  <div className="absolute inset-0 bg-gradient-to-r from-auraGreen/0 via-auraGreen/10 to-auraGreen/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -translate-x-full group-hover:translate-x-full" />
  <span className="relative z-10">Sign In</span>
</button>
      </nav>

      <main className="relative z-10 flex flex-col items-center mt-16 px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-auraGreen/20 bg-auraGreen/5 text-auraGreen text-sm font-medium mb-8">
          ✨ Your AI Mental Health Companion
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
          Find Peace <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500">of Mind</span>
        </h1>
        
        <p className="text-gray-400 text-lg max-w-2xl leading-relaxed mb-12">
          Experience a new way of emotional support. Our AI companion is 
          here to listen, understand, and guide you through life's journey.
        </p>

        {/* Draggable Slider */}
        <div className="w-full max-w-2xl mb-16 relative">
          <p className="text-gray-500 text-sm mb-8 uppercase tracking-wider">Whatever you're feeling, we're here to listen</p>
          
          <div className="flex justify-between items-end px-2 mb-6 relative z-10 pointer-events-none">
            {moods.map((m) => {
              const isActive = activeMood === m.label;
              return (
                <div key={m.label} className={`flex flex-col items-center gap-3 transition-all duration-300 ${isActive ? 'text-auraGreen scale-110 -translate-y-2' : 'text-gray-600'}`}>
                  <div className={`transition-all duration-500 ${isActive ? 'drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]' : ''}`}>{m.icon}</div>
                  <span className={`text-xs font-medium transition-colors duration-300 ${isActive ? 'text-auraGreen' : 'text-gray-600'}`}>{m.label}</span>
                </div>
              );
            })}
          </div>

          <div ref={sliderRef} onMouseDown={handleStart} onTouchStart={handleStart} className="relative w-full h-8 flex items-center cursor-pointer group">
             <div className="absolute w-full h-1.5 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors" />
             <div className={`absolute w-5 h-5 bg-auraGreen rounded-full shadow-[0_0_20px_#4ADE80] transition-all ease-out ${isDragging ? 'duration-0 scale-125' : 'duration-500'}`} style={{ left: `${positionPercent}%`, transform: 'translateX(-50%)' }}>
                <div className="absolute inset-0 m-1.5 bg-white rounded-full opacity-80" />
             </div>
          </div>
        </div>

        <button onClick={() => navigate('/chat')} className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-auraGreen to-green-600 rounded-full text-black font-bold text-lg transition-transform hover:scale-105">
          Begin Your Journey
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
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

const FeatureCard = ({ icon, title, desc }) => (
  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-auraGreen/30 transition-colors text-left">
    <div className="w-12 h-12 rounded-xl bg-auraGreen/10 flex items-center justify-center text-auraGreen mb-4">{icon}</div>
    <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
  </div>
);


// --- AUTH COMPONENT (Sign In / Sign Up) ---
const AuthPage = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Fake authentication delay
    setTimeout(() => {
      setLoading(false);
      navigate('/chat');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-auraBlack text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-auraGreen/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md bg-[#0A0A0A] border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10 backdrop-blur-xl">
        <div className="text-center mb-8">
           <div className="inline-flex items-center gap-2 mb-4">
              <Activity className="text-auraGreen" size={32} />
              <span className="text-2xl font-bold tracking-tight">Aura3.0</span>
           </div>
           <h2 className="text-2xl font-bold mb-2">{isSignUp ? 'Create an Account' : 'Welcome Back'}</h2>
           <p className="text-gray-400 text-sm">
             {isSignUp ? 'Join thousands finding peace of mind.' : 'Sign in to continue your journey.'}
           </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400 ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-auraGreen transition-colors" size={18} />
                <input type="text" placeholder="John Doe" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-auraGreen/50 focus:bg-white/10 transition-all text-white placeholder-gray-600" required />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-auraGreen transition-colors" size={18} />
              <input type="email" placeholder="you@example.com" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-auraGreen/50 focus:bg-white/10 transition-all text-white placeholder-gray-600" required />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400 ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-auraGreen transition-colors" size={18} />
              <input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-auraGreen/50 focus:bg-white/10 transition-all text-white placeholder-gray-600" required />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-auraGreen to-green-600 text-black font-bold py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6">
            {loading ? <Loader2 className="animate-spin" size={20} /> : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-auraGreen font-medium hover:underline">
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>

      <button onClick={() => navigate('/')} className="absolute bottom-8 text-gray-500 hover:text-white transition-colors text-sm flex items-center gap-2">
        <ArrowLeft size={16} /> Back to Home
      </button>
    </div>
  );
};


// --- CHAT INTERFACE COMPONENT ---
const ChatInterface = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([{ id: 1, text: "Hello. I am Aura. I'm here to listen without judgment. How are you feeling right now?", sender: 'bot' }]);
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
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_input: userText })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { id: Date.now()+1, text: data.response, sender: 'bot' }]);
    } catch (err) {
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now()+1, text: "I'm currently unable to reach my AI brain. Please make sure the Python server is running!", sender: 'bot' }]);
      }, 1000);
    } finally { setIsTyping(false); }
  };

  return (
    <div className="min-h-screen bg-auraBlack flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="w-full max-w-4xl h-[85vh] bg-[#0A0A0A] rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden relative">
        <header className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0A0A0A] z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition"><ArrowLeft size={20} /></button>
            <div>
              <h2 className="text-white font-bold text-lg">Aura Companion</h2>
              <div className="flex items-center gap-2"><span className="w-2 h-2 bg-auraGreen rounded-full animate-pulse"></span><span className="text-auraGreen text-xs">Online</span></div>
            </div>
          </div>
          <button className="text-gray-400 hover:text-white"><MoreVertical size={20} /></button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] p-4 rounded-2xl text-sm md:text-base leading-relaxed ${msg.sender === 'user' ? 'bg-auraGreen text-black font-medium rounded-tr-none' : 'bg-white/5 text-gray-200 border border-white/5 rounded-tl-none'}`}>{msg.text}</div>
            </div>
          ))}
          {isTyping && <div className="flex justify-start"><div className="bg-white/5 px-4 py-3 rounded-2xl rounded-tl-none flex gap-1"><span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span><span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></span><span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></span></div></div>}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 md:p-6 bg-[#0A0A0A] border-t border-white/5">
          <div className="relative flex items-center bg-white/5 rounded-full border border-white/10 focus-within:border-auraGreen/50 transition-colors">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Type your thoughts..." className="flex-1 bg-transparent border-none text-white placeholder-gray-500 px-6 py-4 focus:outline-none" />
            <div className="flex items-center gap-2 pr-4">
              {input.length === 0 && <button className="p-2 text-gray-400 hover:text-auraGreen transition"><Mic size={20} /></button>}
              <button onClick={handleSend} className={`p-3 rounded-full transition-all ${input.length > 0 ? 'bg-auraGreen text-black hover:scale-105' : 'bg-white/10 text-gray-500 cursor-not-allowed'}`}><Send size={18} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN ROUTER ---
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/chat" element={<ChatInterface />} />
      </Routes>
    </Router>
  );
}