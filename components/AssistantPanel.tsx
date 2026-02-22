
import React, { useState, useEffect, useRef } from 'react';
import { chatWithAssistant, generateSpeech } from '../services/aiService';
import { ChatMessage } from '../types';

interface AssistantPanelProps {
  currentCode: string;
}

// Encoding/Decoding Utilities for Gemini TTS
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const AssistantPanel: React.FC<AssistantPanelProps> = ({ currentCode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<number | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState<number | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const isOpenRef = useRef(isOpen);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Sync ref with state to handle async closures correctly
  useEffect(() => {
    isOpenRef.current = isOpen;
    if (isOpen) {
      setUnreadCount(0);
      // Pre-initialize AudioContext on open to reduce first-play latency
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    const modelMsg: ChatMessage = { role: 'model', text: "" };
    
    setMessages(prev => [...prev, userMsg, modelMsg]);
    setInput('');
    setLoading(true);

    try {
      await chatWithAssistant(input, currentCode, messages, (text) => {
        setMessages(prev => {
          const newMessages = [...prev];
          if (newMessages.length > 0) {
            newMessages[newMessages.length - 1] = { role: 'model', text: text };
          }
          return newMessages;
        });
      });

      if (!isOpenRef.current) {
        setUnreadCount(prev => prev + 1);
      }
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : "Connectivity interrupted. Please check your configuration.";
      setMessages(prev => {
        const newMessages = [...prev];
        if (newMessages.length > 0) {
          newMessages[newMessages.length - 1] = { role: 'model', text: `⚠️ **System Error**: ${errorMessage}` };
        }
        return newMessages;
      });
      
      if (!isOpenRef.current) {
        setUnreadCount(prev => prev + 1);
      }
    } finally {
      setLoading(false);
    }
  };

  const stopAudio = () => {
    if (speechSynthesis.speaking || speechSynthesis.pending) {
      speechSynthesis.cancel();
    }
    speechUtteranceRef.current = null;

    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
      } catch (e) {}
      currentSourceRef.current = null;
    }
    setPlayingAudioId(null);
  };

  const handleListen = async (text: string, index: number) => {
    // Resume immediately upon interaction
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }

    if (playingAudioId === index || isGeneratingAudio === index) {
      stopAudio();
      setIsGeneratingAudio(null);
      return;
    }
    
    stopAudio();
    setIsGeneratingAudio(index);
    
    try {
      // Start generating
      const base64Audio = await generateSpeech(text);
      if (!base64Audio) {
        if (!('speechSynthesis' in window)) {
          throw new Error('Speech synthesis is not supported in this browser.');
        }

        setIsGeneratingAudio(null);
        setPlayingAudioId(index);

        const utterance = new SpeechSynthesisUtterance(
          text
            .replace(/#+\s/g, '')
            .replace(/\*+/g, '')
            .replace(/`{1,3}[\s\S]*?`{1,3}/g, 'Code block omitted.')
            .trim()
        );

        utterance.onend = () => {
          if (speechUtteranceRef.current === utterance) {
            speechUtteranceRef.current = null;
            setPlayingAudioId(null);
          }
        };

        utterance.onerror = () => {
          if (speechUtteranceRef.current === utterance) {
            speechUtteranceRef.current = null;
            setPlayingAudioId(null);
          }
        };

        speechUtteranceRef.current = utterance;
        speechSynthesis.speak(utterance);
        return;
      }

      const ctx = audioContextRef.current!;
      const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
      
      if (isGeneratingAudio !== index) return; // User cancelled
      
      setIsGeneratingAudio(null);
      setPlayingAudioId(index);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => {
        if (currentSourceRef.current === source) {
           setPlayingAudioId(null);
           currentSourceRef.current = null;
        }
      };
      
      currentSourceRef.current = source;
      source.start(0); // Play immediately
    } catch (e) {
      console.error("TTS failed:", e);
      setIsGeneratingAudio(null);
      setPlayingAudioId(null);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-10 right-10 w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-full shadow-[0_10px_40px_rgba(37,99,235,0.4)] flex items-center justify-center hover:scale-110 hover:-translate-y-1 active:scale-95 transition-all z-40 border-4 border-white group"
      >
        <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20 group-hover:hidden"></div>
        <i className="fas fa-robot text-2xl relative"></i>
        {unreadCount > 0 && !isOpen && (
           <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full border-2 border-white text-[10px] font-black flex items-center justify-center shadow-lg animate-bounce">
             {unreadCount}
           </span>
        )}
      </button>

      {/* Chat Drawer */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.15)] z-50 flex flex-col animate-in slide-in-from-right duration-300 ease-out border-l border-slate-100 overflow-hidden">
          
          <div className="p-6 bg-slate-900 text-white flex justify-between items-center shrink-0 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-lg shadow-inner shadow-white/20 border border-blue-400/30">
                <i className="fas fa-robot"></i>
              </div>
              <div>
                <h3 className="font-black text-base tracking-[0.15em] uppercase">AI ASSISTANT</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Ready to assist</p>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all group"
            >
              <i className="fas fa-times text-lg group-hover:rotate-90 transition-transform"></i>
            </button>
          </div>

          <div 
            ref={scrollRef} 
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#f8fafc] custom-scrollbar selection:bg-blue-100"
          >
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center px-10">
                <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-sm flex items-center justify-center text-slate-100 text-4xl mb-8 border border-slate-100/50">
                  <i className="fas fa-sparkles text-indigo-500 opacity-20"></i>
                </div>
                <h4 className="text-slate-800 font-black text-xl mb-3 uppercase tracking-[0.1em]">Welcome, Explorer.</h4>
                <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-[280px]">
                  How can I help you build something amazing today?
                </p>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`relative group w-full ${m.role === 'user' ? 'max-w-[85%] ml-auto' : 'max-w-[95%]'}`}>
                  
                  <div className={`p-4 rounded-2xl text-[13px] shadow-sm border overflow-hidden ${
                    m.role === 'user' 
                      ? 'bg-blue-600 text-white border-blue-500 rounded-tr-none font-medium shadow-blue-200' 
                      : 'bg-white border-slate-200 text-slate-700 rounded-tl-none shadow-slate-100'
                  }`}>
                    <div 
                      className={`prose prose-sm max-w-none leading-relaxed break-words ${m.role === 'user' ? 'prose-invert text-white' : 'prose-slate'}`}
                      dangerouslySetInnerHTML={{ __html: (window as any).marked.parse(m.text || "") }}
                    />
                  </div>
                  
                  <div className={`mt-2 flex items-center gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {m.role === 'model' && m.text && (
                      <button 
                        onClick={() => handleListen(m.text, i)}
                        disabled={isGeneratingAudio !== null && isGeneratingAudio !== i}
                        className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all border ${
                          playingAudioId === i 
                            ? 'text-red-600 bg-red-50 border-red-200 shadow-sm' 
                            : isGeneratingAudio === i
                            ? 'text-indigo-600 bg-indigo-50 border-indigo-200 animate-pulse'
                            : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-100 active:scale-95 border-transparent'
                        }`}
                      >
                        <i className={`fas ${
                          playingAudioId === i 
                            ? 'fa-stop-circle' 
                            : isGeneratingAudio === i 
                            ? 'fa-circle-notch animate-spin' 
                            : 'fa-volume-up'
                        }`}></i>
                        {playingAudioId === i ? 'Stop' : isGeneratingAudio === i ? 'Voice Loading...' : 'Speak Reply'}
                      </button>
                    )}
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                      {m.role === 'user' ? 'USER' : 'AI RESPONSE'}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {loading && messages[messages.length-1]?.text === "" && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 p-5 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Processing</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-slate-100 bg-white">
            <div className="relative flex items-end gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-2.5 transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50 focus-within:bg-white">
              <textarea 
                rows={1}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask me a coding question..." 
                className="flex-1 bg-transparent border-none px-3 py-2 text-sm focus:ring-0 outline-none resize-none max-h-32 font-medium text-slate-700 placeholder:text-slate-400 custom-scrollbar"
              />
              <button 
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="w-11 h-11 bg-blue-600 text-white rounded-xl flex items-center justify-center transition-all hover:bg-blue-700 hover:scale-105 active:scale-95 disabled:opacity-30 shadow-lg shadow-blue-500/20"
              >
                <i className={`fas ${loading ? 'fa-circle-notch animate-spin' : 'fa-paper-plane'} text-sm`}></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
