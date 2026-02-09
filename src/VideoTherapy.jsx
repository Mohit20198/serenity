import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import * as faceapi from '@vladmandic/face-api';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';

const VideoTherapy = () => {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const [emotion, setEmotion] = useState('detecting...');
  const [messages, setMessages] = useState([{ id: 1, text: "Hi, I can see you now. How are you feeling?", sender: 'bot' }]);
  const [input, setInput] = useState('');
  const [modelsLoaded, setModelsLoaded] = useState(false);

  // 1. Load Face API Models
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error("Failed to load models", err);
      }
    };
    loadModels();
  }, []);

  // 2. Detect Emotions Loop
  useEffect(() => {
    let interval;
    if (modelsLoaded) {
      interval = setInterval(async () => {
        if (webcamRef.current && webcamRef.current.video.readyState === 4) {
          const video = webcamRef.current.video;
          
          const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceExpressions();

          if (detections.length > 0) {
            const expressions = detections[0].expressions;
            const maxEmotion = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);
            setEmotion(maxEmotion);
          }
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [modelsLoaded]);

  // 3. Send Message (With Emotion Context)
  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input;
    const currentEmotion = emotion; 
    
    setMessages(prev => [...prev, { id: Date.now(), text: userText, sender: 'user' }]);
    setInput('');

    try {
      const response = await fetch('api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            user_input: userText,
            emotion: currentEmotion 
        })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { id: Date.now()+1, text: data.response, sender: 'bot' }]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-auraBlack text-white flex flex-col md:flex-row font-sans overflow-hidden">
      {/* LEFT: Video Feed */}
      <div className="w-full md:w-1/2 p-6 flex flex-col items-center justify-center bg-black/40 relative border-r border-white/10">
         <button onClick={() => navigate('/dashboard')} className="absolute top-6 left-6 z-20 p-2 bg-black/50 rounded-full hover:bg-white/20">
            <ArrowLeft className="text-white" />
         </button>
         
         <div className="relative rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl w-full max-w-md aspect-video bg-black">
            {modelsLoaded ? (
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                className="absolute inset-0 w-full h-full object-cover mirror" 
                mirrored={true}
              />
            ) : (
              <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-auraGreen" size={40} /></div>
            )}
            
            {/* Emotion Badge */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/20 flex items-center gap-2">
               <div className={`w-3 h-3 rounded-full ${emotion === 'happy' ? 'bg-green-500' : emotion === 'sad' ? 'bg-blue-500' : 'bg-yellow-500'} animate-pulse`} />
               <span className="uppercase tracking-widest text-xs font-bold">{emotion}</span>
            </div>
         </div>
         <p className="mt-6 text-gray-500 text-sm text-center max-w-xs">
           Serenity is analyzing your facial expressions to provide better support.
         </p>
      </div>

      {/* RIGHT: Chat Interface */}
      <div className="w-full md:w-1/2 flex flex-col h-[50vh] md:h-screen bg-[#0A0A0A]">
         <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-auraGreen text-black rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
         </div>
         <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-2 border border-white/10">
               <input 
                 value={input} 
                 onChange={e => setInput(e.target.value)} 
                 onKeyPress={e => e.key === 'Enter' && handleSend()}
                 placeholder="Type your thoughts..."
                 className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
               />
               <button onClick={handleSend} className="p-2 bg-auraGreen rounded-full text-black hover:scale-105 transition"><Send size={18}/></button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default VideoTherapy;