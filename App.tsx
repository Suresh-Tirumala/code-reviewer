
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { AssistantPanel } from './components/AssistantPanel';
import { Login } from './components/Login';
import { LandingPage } from './components/LandingPage';
import { LogoGenerator } from './components/LogoGenerator';
import { AboutModal } from './components/AboutModal';
import { analyzeCode, rewriteCode, runSimulatedCode } from './services/aiService';
import { TabType, User, CodeReviewResult, CodeRewriteResult, TerminalOutput, HistoryItem, Severity } from './types';
import { AnimatePresence, motion } from 'motion/react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('editor');
  const [code, setCode] = useState('/* Sample CSS */\n.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);\n  color: white;\n  font-family: system-ui;\n}\n\n.card {\n  padding: 3rem;\n  background: rgba(255,255,255,0.1);\n  backdrop-filter: blur(12px);\n  border-radius: 1.5rem;\n  border: 1px solid rgba(255,255,255,0.2);\n  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);\n  text-align: center;\n}\n\n.card h1 {\n  font-size: 2.5rem;\n  margin-bottom: 1rem;\n  font-weight: 800;\n}');
  const [language, setLanguage] = useState('css');
  const [focus, setFocus] = useState<string[]>(['Bugs', 'Security']);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [view, setView] = useState<'landing' | 'auth' | 'app'>(user ? 'app' : 'landing');
  
  const [customLogo, setCustomLogo] = useState<string | null>(() => {
    return localStorage.getItem('custom_robot_logo');
  });
  const [showAbout, setShowAbout] = useState(false);
  
  const [review, setReview] = useState<CodeReviewResult | null>(null);
  const [rewrite, setRewrite] = useState<CodeRewriteResult | null>(null);
  const [terminal, setTerminal] = useState<TerminalOutput | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('code_reviewer_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('code_reviewer_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (customLogo) {
      localStorage.setItem('custom_robot_logo', customLogo);
    }
  }, [customLogo]);

  useEffect(() => {
    if (code.length > 5 && (window as any).hljs) {
      const detection = (window as any).hljs.highlightAuto(code);
      if (detection.language && detection.language !== language) {
        setLanguage(detection.language);
      }
    }
  }, [code, language]);

  const addToHistory = (type: HistoryItem['type'], summary: string, result: any) => {
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      type,
      language,
      codePreview: code.substring(0, 80) + (code.length > 80 ? '...' : ''),
      resultSummary: summary,
      fullCode: code,
      result: result
    };
    setHistory(prev => [newItem, ...prev]);
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setCode(item.fullCode);
    setLanguage(item.language);
    if (item.type === 'Review') {
      setReview(item.result);
      setActiveTab('review');
    } else if (item.type === 'Rewrite') {
      setRewrite(item.result);
      setActiveTab('rewrite');
    } else if (item.type === 'Run') {
      setTerminal(item.result);
      setActiveTab('output');
    }
  };

  const handleReview = async () => {
    setLoading('review');
    setActiveTab('review');
    setReview(null); 
    try {
      const result = await analyzeCode(code, language, focus);
      setReview(result);
      addToHistory('Review', `Analyzed ${focus.join(', ')} - ${result.suggestions.length} findings`, result);
    } catch (e: any) {
       alert(e.message);
    } finally {
      setLoading(null);
    }
  };

  const handleRewrite = async () => {
    setLoading('rewrite');
    setActiveTab('rewrite');
    setRewrite(null); 
    try {
      const result = await rewriteCode(code, language, (text) => {
        setRewrite({
          rewrittenCode: "",
          summary: "Processing...",
          improvements: [],
          explanation: text
        });
      });
      setRewrite(result);
      addToHistory('Rewrite', result.summary.substring(0, 50) + '...', result);
    } catch (e: any) {
       alert(e.message);
    } finally {
      setLoading(null);
    }
  };

  const handleRun = async () => {
    setLoading('run');
    setActiveTab('output');
    setTerminal(null); 
    try {
      const result = await runSimulatedCode(code, language);
      setTerminal(result);
      addToHistory('Run', result.stdout.substring(0, 50) + '...', result);
    } catch (e: any) {
       alert(e.message);
    } finally {
      setLoading(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCode(content);
        setActiveTab('editor');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleLogout = () => {
    setUser(null);
    setShowSettings(false);
    setView('landing');
  };

  const toggleFocusArea = (area: string) => {
    setFocus(prev => prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]);
  };

  const handleEnterAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setView('auth');
  };

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
    setView('app');
  };

  if (!user) {
    return (
      <>
        <AnimatePresence mode="wait">
          {view === 'landing' ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="w-full h-full"
            >
              <LandingPage 
                onEnter={handleEnterAuth} 
                onAboutClick={() => setShowAbout(true)}
                customLogo={customLogo} 
              />
            </motion.div>
          ) : (
            <motion.div
              key="auth"
              initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="w-full h-full"
            >
              <Login onLogin={handleLoginSuccess} customLogo={customLogo} initialMode={authMode} />
            </motion.div>
          )}
        </AnimatePresence>
        
        <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
      </>
    );
  }

  const isWebLanguage = ['css', 'html', 'xml', 'svg'].includes(language.toLowerCase());

  const severityColors = {
    [Severity.CRITICAL]: 'bg-red-500/20 text-red-400 border-red-500/30',
    [Severity.HIGH]: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    [Severity.MEDIUM]: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    [Severity.LOW]: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  const actionButtons = (
    <div className="flex items-center gap-3">
      <button 
        onClick={handleRun}
        disabled={!!loading}
        className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-700 hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-50"
      >
        <i className={`fas ${loading === 'run' ? 'fa-circle-notch animate-spin' : 'fa-play'} text-xs`}></i> Run
      </button>
      <button 
        onClick={handleRewrite}
        disabled={!!loading}
        className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-500 hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-50"
      >
        <i className={`fas ${loading === 'rewrite' ? 'fa-circle-notch animate-spin' : 'fa-wand-magic-sparkles'} text-xs`}></i> Rewrite
      </button>
      <button 
        onClick={handleReview}
        disabled={!!loading}
        className="px-5 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-orange-500 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
      >
        <i className={`fas ${loading === 'review' ? 'fa-circle-notch animate-spin' : 'fa-bolt'} text-xs`}></i> Analyze
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenSettings={() => setShowSettings(true)} 
        onOpenProfile={() => setShowProfile(true)}
        user={user}
        customLogo={customLogo}
      />
      
      <div className="flex-1 flex flex-col">
        <main className="flex-1 flex flex-col p-4 md:p-8 max-w-[1400px] mx-auto w-full relative">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-black text-[#1e293b] tracking-tight">Coding Workspace</h1>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/20">
                  <i className="fas fa-microchip text-indigo-200 animate-pulse"></i>
                  <span className="uppercase tracking-widest">LANG:</span>
                  <span className="bg-white/20 px-1.5 py-0.5 rounded uppercase tracking-tighter">{language}</span>
                </div>
                
                <div className="flex gap-2">
                  {['Bugs', 'Security', 'Performance', 'Cleanliness'].map(area => (
                    <button 
                      key={area}
                      onClick={() => toggleFocusArea(area)}
                      className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                        focus.includes(area) 
                        ? 'bg-slate-800 text-white border-slate-700' 
                        : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400'
                      } border`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {actionButtons}
          </header>

          <div className="grid grid-cols-1 gap-6 flex-1">
            {activeTab === 'editor' && (
              <div className="bg-white rounded-2xl border border-slate-custom shadow-xl flex flex-col overflow-hidden h-full min-h-[700px]">
                 <div className="px-6 py-4 border-b border-slate-custom flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-4">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">MAIN EDITOR</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-blue-600 border border-blue-200 hover:bg-blue-50 transition-all flex items-center gap-2 cursor-pointer">
                        <i className="fas fa-upload"></i> Upload File
                        <input type="file" className="hidden" onChange={handleFileUpload} />
                      </label>
                    </div>
                 </div>
                 <div className="flex-1 relative editor-bg">
                    <textarea 
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="absolute inset-0 w-full h-full p-10 code-font text-slate-700 focus:outline-none resize-none bg-transparent"
                      spellCheck={false}
                    />
                 </div>
              </div>
            )}

            {activeTab === 'review' && (
              <div className="bg-white rounded-2xl border border-slate-custom shadow-xl flex flex-col overflow-hidden h-full min-h-[600px]">
                <div className="px-6 py-4 border-b border-slate-custom flex justify-between items-center bg-slate-50">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">REVIEW ANALYSIS</span>
                  {review && (
                    <div className="flex gap-2">
                      {focus.map(f => (
                        <span key={f} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase rounded border border-indigo-100">
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 p-10 overflow-y-auto custom-scrollbar bg-[#fcfcfd]">
                  {review ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
                      <div className="lg:col-span-2 space-y-12">
                        <div className="prose max-w-none prose-slate prose-headings:text-slate-900 prose-headings:font-black prose-h2:border-b prose-h2:border-slate-100 prose-h2:pb-4 prose-h2:mt-12" 
                             dangerouslySetInnerHTML={{ __html: (window as any).marked.parse(review.markdown) }} />
                        
                        <div className="pt-10 border-t border-slate-200 space-y-6">
                          <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-3">
                            <i className="fas fa-list-check text-indigo-600"></i> Actionable Findings
                          </h3>
                          <div className="grid grid-cols-1 gap-4">
                            {review.suggestions.map((item, idx) => (
                              <div key={idx} className="p-6 bg-white border border-slate-200 rounded-2xl hover:border-indigo-300 hover:shadow-lg transition-all group">
                                <div className="flex justify-between items-start mb-3">
                                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${severityColors[item.severity as Severity] || 'bg-slate-100'}`}>
                                    {item.severity}
                                  </span>
                                  {item.line && <span className="text-[10px] text-slate-400 font-bold font-mono bg-slate-100 px-2 py-1 rounded-md">LINE {item.line}</span>}
                                </div>
                                <h4 className="font-bold text-slate-900 mb-2 text-base">{item.issue}</h4>
                                <p className="text-sm text-slate-600 leading-relaxed font-medium">{item.recommendation}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl sticky top-8 border border-white/5">
                          <div className="flex items-center gap-3 mb-8 border-b border-slate-800 pb-4">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                              <i className="fas fa-chart-pie"></i>
                            </div>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Incident Health</h3>
                          </div>
                          
                          <div className="space-y-6">
                            {Object.values(Severity).map(sev => {
                              const count = review.counts[sev] || 0;
                              return (
                                <div key={sev} className="flex justify-between items-center group cursor-default">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${count > 0 ? 'bg-indigo-500 animate-pulse' : 'bg-slate-700'}`}></div>
                                    <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors uppercase tracking-tighter">{sev}</span>
                                  </div>
                                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                                    count > 0 ? 'bg-white text-slate-900 shadow-xl' : 'bg-slate-800 text-slate-500'
                                  }`}>
                                    {count}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                          
                          <div className="mt-10 pt-8 border-t border-slate-800">
                            <button 
                              onClick={handleRewrite}
                              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-indigo-600/20"
                            >
                              Auto-Fix Found Issues
                            </button>
                          </div>
                        </div>

                        <div className="p-8 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-[2rem] shadow-inner">
                           <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                             <i className="fas fa-lightbulb"></i> Analysis Context
                           </p>
                           <p className="text-xs text-indigo-900/70 font-semibold leading-relaxed">
                             This report highlights critical architectural decisions in the <span className="text-indigo-600">{language}</span> environment, specifically targeting {focus.slice(0, -1).join(', ')}{focus.length > 1 ? ' and ' : ''}{focus.slice(-1)}.
                           </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center py-40">
                      <div className="relative mb-8">
                         <div className="absolute inset-0 bg-orange-100 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                         {loading === 'review' ? (
                           <div className="relative w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center border border-slate-100">
                             <i className="fas fa-circle-notch animate-spin text-4xl text-orange-600"></i>
                           </div>
                         ) : (
                           <div className="relative w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center border border-slate-100">
                             <i className="fas fa-magnifying-glass text-4xl text-slate-300"></i>
                           </div>
                         )}
                      </div>
                      <h3 className="text-xl font-black text-slate-800 uppercase tracking-[0.1em] mb-2">
                        {loading === 'review' ? 'Analysis in Progress' : 'Analysis Engine Standby'}
                      </h3>
                      <p className="text-sm text-slate-400 font-medium max-w-[320px] mx-auto leading-relaxed">
                        {loading === 'review' ? 'The AI is currently explaining your code and checking your selected focus areas...' : 'Paste your code in the editor and select focus areas like Bugs or Security to begin.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'rewrite' && (
               <div className="space-y-6">
                 <div className="bg-white rounded-2xl border border-slate-custom shadow-xl overflow-hidden flex flex-col min-h-[600px]">
                    <div className="px-6 py-4 border-b border-slate-custom bg-slate-50 flex justify-between items-center">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">REFACTORED RESULT</span>
                      {rewrite?.rewrittenCode && (
                        <button 
                          onClick={() => rewrite && navigator.clipboard.writeText(rewrite.rewrittenCode)}
                          className="text-xs font-black text-orange-600 flex items-center gap-2 hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-all active:scale-95"
                        >
                          <i className="fas fa-copy"></i> COPY RAW CODE
                        </button>
                      )}
                    </div>
                    <div className="p-10 bg-white space-y-10">
                      {rewrite ? (
                        <div className="animate-in fade-in duration-300">
                          <div className="prose max-w-none prose-slate border-b border-slate-100 pb-10" 
                               dangerouslySetInnerHTML={{ __html: (window as any).marked.parse(rewrite.explanation) }} />
                          
                          {rewrite.rewrittenCode && (
                            <div className="space-y-4 mt-8">
                              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <i className="fas fa-sparkles text-emerald-500"></i> FINAL OPTIMIZED CODE
                              </h3>
                              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-2xl">
                                <pre className="p-8 bg-[#0f172a] text-slate-100 code-font text-sm overflow-x-auto leading-relaxed custom-scrollbar">
                                  <code>{rewrite.rewrittenCode}</code>
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="py-32 flex flex-col items-center gap-4 opacity-20">
                           {loading === 'rewrite' ? (
                             <i className="fas fa-circle-notch animate-spin text-8xl text-emerald-600"></i>
                           ) : (
                             <i className="fas fa-wand-magic-sparkles text-8xl text-emerald-600"></i>
                           )}
                           <p className="font-black text-lg">{loading === 'rewrite' ? 'Optimizing your code for better performance and readability...' : 'Awaiting refactor request...'}</p>
                        </div>
                      )}
                    </div>
                 </div>
               </div>
            )}

            {activeTab === 'output' && (
              <div className="bg-slate-900 rounded-2xl shadow-2xl overflow-hidden h-[750px] flex flex-col border border-slate-800">
                <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                   <div className="flex items-center gap-4">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                        {isWebLanguage ? 'VISUAL PREVIEW ENVIRONMENT' : 'SIMULATED TERMINAL'}
                      </span>
                   </div>
                   {isWebLanguage && terminal && (
                     <div className="flex items-center gap-2 px-3 py-1 bg-indigo-600/20 text-indigo-400 text-[9px] font-black uppercase rounded-full border border-indigo-500/30">
                       <i className="fas fa-eye animate-pulse"></i> LIVE RENDER
                     </div>
                   )}
                </div>
                <div className="flex-1 flex flex-col overflow-hidden">
                  {terminal ? (
                    <div className="flex-1 flex flex-col w-full h-full animate-in fade-in duration-500">
                       <div className="flex-1 flex overflow-hidden">
                          {!isWebLanguage ? (
                            <div className="flex-1 p-10 code-font text-sm overflow-y-auto custom-scrollbar bg-slate-900/50">
                               <div className="space-y-8">
                                  <div>
                                    <p className="text-emerald-400 font-bold tracking-[0.2em] text-[10px] mb-4 flex items-center gap-2">
                                      <i className="fas fa-chevron-right text-[8px]"></i> SYSTEM STDOUT
                                    </p>
                                    <pre className="text-slate-300 ml-2 whitespace-pre-wrap code-font bg-slate-800/30 p-6 rounded-2xl border border-slate-700/50 shadow-inner">
                                      {terminal.stdout || "(no output returned)"}
                                    </pre>
                                  </div>
                               </div>
                            </div>
                          ) : (
                            <div className="flex-1 bg-white relative flex flex-col h-full w-full">
                              <div className="w-full h-full bg-[#f8fafc] p-0.5 overflow-hidden">
                                <iframe 
                                  key={terminal.stdout} 
                                  title="Web Preview"
                                  srcDoc={terminal.stdout}
                                  className="w-full h-full border-none bg-white"
                                  sandbox="allow-scripts"
                                />
                              </div>
                            </div>
                          )}
                       </div>

                       {terminal.stderr && (
                          <div className="bg-red-950/20 border-t border-red-900/30 p-6 max-h-40 overflow-y-auto custom-scrollbar">
                             <p className="text-red-400 font-bold tracking-[0.2em] text-[10px] mb-2 flex items-center gap-2">
                               <i className="fas fa-triangle-exclamation text-[8px]"></i> RUNTIME STDERR
                             </p>
                             <pre className="text-red-300 ml-2 whitespace-pre-wrap code-font text-xs">
                               {terminal.stderr}
                             </pre>
                          </div>
                       )}
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-700 bg-slate-900">
                       <div className="text-center">
                          {loading === 'run' ? (
                            <i className="fas fa-circle-notch animate-spin text-7xl mb-6 text-blue-500 opacity-50"></i>
                          ) : (
                            <i className="fas fa-terminal text-7xl mb-6 opacity-10"></i>
                          )}
                          <p className="text-sm font-bold opacity-30 tracking-widest uppercase">
                            {loading === 'run' ? 'Setting up a safe environment to run your code...' : 'Runtime Environment Ready'}
                          </p>
                       </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="bg-white rounded-2xl border border-slate-custom shadow-xl overflow-hidden min-h-[600px]">
                <div className="px-6 py-4 border-b border-slate-custom flex justify-between items-center bg-slate-50">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">SESSION ARCHIVE</span>
                  <button 
                    onClick={() => setHistory([])}
                    className="text-[10px] text-red-500 hover:text-red-700 font-black uppercase px-3 py-1.5 rounded-lg border border-red-100 hover:bg-red-50 transition-all"
                  >
                    Purge All History
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {history.length > 0 ? history.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => loadHistoryItem(item)}
                      className="p-8 hover:bg-slate-50 transition-all group cursor-pointer border-l-4 border-transparent hover:border-blue-500"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-4">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            item.type === 'Review' ? 'bg-orange-100 text-orange-600' :
                            item.type === 'Rewrite' ? 'bg-emerald-100 text-emerald-600' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {item.type}
                          </span>
                          <span className="text-[11px] font-bold text-slate-400">{new Date(item.timestamp).toLocaleString()}</span>
                        </div>
                        <i className="fas fa-chevron-right text-slate-200 group-hover:text-blue-500 transition-colors"></i>
                      </div>
                      <p className="text-sm font-bold text-slate-700 mb-2 line-clamp-1 code-font tracking-tight">{item.codePreview}</p>
                      <p className="text-xs text-slate-400 italic font-medium">{item.resultSummary}</p>
                    </div>
                  )) : (
                    <div className="py-40 text-center opacity-10">
                      <i className="fas fa-folder-open text-8xl mb-6"></i>
                      <p className="text-lg font-black uppercase tracking-[0.2em]">Archive Empty</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>

        {showSettings && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-white/20">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-black text-slate-800 flex items-center gap-3">
                  <i className="fas fa-sliders text-blue-600"></i> WORKSPACE CONFIG
                </h3>
                <button onClick={() => setShowSettings(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-all">
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="p-10 space-y-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-black text-slate-700 uppercase tracking-tighter">Auto-save Pulse</p>
                      <p className="text-xs text-slate-500 font-medium">Commit sessions to local vault</p>
                    </div>
                    <div className="w-14 h-7 bg-blue-600 rounded-full relative cursor-pointer ring-4 ring-blue-100">
                      <div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full shadow-lg"></div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Visual Identity</p>
                    <LogoGenerator onLogoGenerated={setCustomLogo} currentLogo={customLogo || undefined} />
                  </div>

                  <div className="pt-8 border-t border-slate-100">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center justify-between px-6 py-4 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 transition-all group"
                    >
                      <span className="font-black text-xs uppercase tracking-widest">Terminate Session</span>
                      <i className="fas fa-power-off group-hover:rotate-90 transition-transform"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-8 bg-slate-50 text-center">
                <button 
                  onClick={() => setShowSettings(false)}
                  className="w-full py-4 bg-[#1e293b] text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-slate-800 transition-all active:scale-95"
                >
                  Apply Configuration
                </button>
              </div>
            </div>
          </div>
        )}

        {showProfile && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="h-32 bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600 relative">
                <button onClick={() => setShowProfile(false)} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 text-white/80 hover:bg-black/40 transition-all">
                  <i className="fas fa-times text-xs"></i>
                </button>
              </div>
              <div className="px-10 pb-10 -mt-16 text-center relative">
                <div className="w-32 h-32 bg-white rounded-[2.5rem] shadow-2xl flex items-center justify-center text-4xl text-blue-600 font-black mx-auto border-8 border-white mb-6">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">{user.name}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">{user.role || 'Senior Engineer'}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                    <p className="text-2xl font-black text-blue-600">{history.length}</p>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Archived</p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                    <p className="text-2xl font-black text-emerald-500">Live</p>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Status</p>
                  </div>
                </div>

                <div className="text-left space-y-4 px-2">
                  <div className="flex items-center gap-4 text-slate-600">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <i className="fas fa-envelope text-xs"></i>
                    </div>
                    <span className="text-sm font-bold truncate">{user.email}</span>
                  </div>
                </div>

                <button 
                  onClick={() => setShowProfile(false)}
                  className="w-full mt-10 py-4 bg-blue-600 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                >
                  Return to Console
                </button>
              </div>
            </div>
          </div>
        )}

        <AssistantPanel currentCode={code} />
      </div>
    </div>
  );
};

export default App;
