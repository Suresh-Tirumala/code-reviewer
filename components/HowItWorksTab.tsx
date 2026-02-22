
import React from 'react';

export const HowItWorksTab: React.FC = () => {
  const steps = [
    {
      icon: 'fas fa-shield-halved',
      title: 'Security Gateway',
      desc: 'Access the workspace via our 3D-encrypted gateway. Your session remains sandboxed and private.',
      color: 'bg-indigo-600',
      label: 'STEP 01'
    },
    {
      icon: 'fas fa-microchip',
      title: 'Neural Analysis',
      desc: 'Our LLM clusters parse your code structure, identifying logic flaws and security leaks.',
      color: 'bg-blue-600',
      label: 'STEP 02'
    },
    {
      icon: 'fas fa-wand-magic-sparkles',
      title: 'Agentic Rewrite',
      desc: 'Receive a full refactor that follows industry standard design patterns and performance optimizations.',
      color: 'bg-purple-600',
      label: 'STEP 03'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 animate-in fade-in duration-700">
      {/* Hero Header */}
      <div className="text-center mb-20">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
          <i className="fas fa-book-open"></i> System Documentation
        </div>
        <h2 className="text-5xl font-black text-[#0f172a] mb-6 tracking-tight uppercase">
          How <span className="text-indigo-600">CODING AGENT</span> Thinks.
        </h2>
        <p className="text-slate-500 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
          The future of development is collaborative. Learn how our AI engine integrates with your workflow to ensure zero-defect deployments.
        </p>
      </div>

      {/* Process Flow */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative mb-24">
        {steps.map((step, idx) => (
          <div key={idx} className="relative group">
            <div className="bg-white border border-slate-200 p-10 rounded-[2.5rem] h-full shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-8xl group-hover:opacity-[0.08] transition-opacity">
                <i className={step.icon}></i>
              </div>
              
              <div className={`w-14 h-14 ${step.color} rounded-2xl flex items-center justify-center text-2xl text-white mb-8 shadow-xl`}>
                <i className={step.icon}></i>
              </div>

              <span className="text-[10px] font-black text-indigo-600/50 uppercase tracking-[0.3em] mb-4 block">
                {step.label}
              </span>
              
              <h3 className="font-black text-xl text-slate-800 mb-4 tracking-tight">{step.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Insights - Split Panel Style */}
      <div className="bg-slate-900 rounded-[3rem] overflow-hidden flex flex-col lg:flex-row shadow-2xl border border-white/5">
        <div className="lg:w-1/2 p-16 flex flex-col justify-center">
           <h3 className="text-3xl font-black text-white mb-8 tracking-tight">
             Advanced Logic Detection
           </h3>
           <div className="space-y-6">
             <div className="flex gap-4">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-indigo-400">
                  <i className="fas fa-bolt-lightning"></i>
                </div>
                <div>
                   <h4 className="text-white font-bold mb-1">Low-Latency Inference</h4>
                   <p className="text-slate-400 text-sm leading-relaxed">Powered by advanced reasoning technology, providing analysis in real-time.</p>
                </div>
             </div>
             <div className="flex gap-4">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
                  <i className="fas fa-layer-group"></i>
                </div>
                <div>
                   <h4 className="text-white font-bold mb-1">Multi-Pass Verification</h4>
                   <p className="text-slate-400 text-sm leading-relaxed">The AI reviews its own suggestions to eliminate mistakes before you see them.</p>
                </div>
             </div>
           </div>
        </div>

        <div className="lg:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 p-16 flex items-center justify-center relative overflow-hidden">
           <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full editor-bg invert"></div>
           </div>
           
           <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-8 rounded-3xl shadow-2xl relative z-10">
              <div className="flex items-center gap-2 mb-6">
                 <div className="w-3 h-3 rounded-full bg-red-400"></div>
                 <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                 <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              </div>
              <pre className="code-font text-xs text-indigo-100/80 leading-relaxed">
                <code>{`// AI Suggestion Applied
function optimize(data) {
  // Memoized for performance
  const cache = new Map();
  return data.map(item => {
    if (cache.has(item.id)) 
      return cache.get(item.id);
    // ...
  });
}`}</code>
              </pre>
           </div>
        </div>
      </div>

      <div className="mt-20 text-center">
        <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">
          Still have questions? Chat with our <span className="text-indigo-600 font-black">AI ASSISTANT</span> in the side panel for real-time guidance.
        </p>
      </div>
    </div>
  );
};
