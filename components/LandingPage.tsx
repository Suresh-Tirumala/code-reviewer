import React from 'react';
import Orb from './Orb';
import PillNav from './PillNav';
import { motion } from 'motion/react';
import { RobotLogo } from './RobotLogo';

interface LandingPageProps {
  onEnter: (mode: 'login' | 'signup') => void;
  onAboutClick: () => void;
  customLogo: string | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter, onAboutClick, customLogo }) => {
  const navItems = [
    { label: 'Home', href: '#' },
    { label: 'Features', href: '#features' },
    { label: 'About', href: '#', onClick: onAboutClick }
  ];

  const features = [
    {
      title: "AI Analysis",
      description: "Deep reasoning engine that identifies bugs, security flaws, and performance bottlenecks before they hit production.",
      icon: "fa-magnifying-glass",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Smart Refactor",
      description: "Automated code transformation that modernizes your syntax and optimizes logic with a single click.",
      icon: "fa-wand-magic-sparkles",
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Safe Sandbox",
      description: "Execute and test your code in an isolated environment with real-time terminal feedback.",
      icon: "fa-terminal",
      color: "from-emerald-500 to-teal-500"
    },
    {
      title: "Live Preview",
      description: "Instant visual rendering for web projects. See your HTML and CSS changes come to life as you type.",
      icon: "fa-eye",
      color: "from-orange-500 to-red-500"
    },
    {
      title: "Session Archive",
      description: "Every review and rewrite is automatically saved to your history vault for future reference.",
      icon: "fa-clock-rotate-left",
      color: "from-indigo-500 to-blue-500"
    },
    {
      title: "Custom Identity",
      description: "Personalize your workspace with AI-generated logos that reflect your project's unique character.",
      icon: "fa-robot",
      color: "from-rose-500 to-pink-500"
    }
  ];

  return (
    <div className="relative w-full min-h-screen bg-black overflow-x-hidden scroll-smooth">
      {/* Navigation */}
      <PillNav 
        logo={customLogo ? customLogo : <RobotLogo className="w-8 h-8" />} 
        items={navItems}
        baseColor="#ffffff"
        pillColor="#6366f1"
        hoveredPillTextColor="#000000"
      />

      {/* Hero Section */}
      <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        {/* Background Orb */}
        <div className="absolute inset-0 z-0">
          <Orb 
            hue={260} 
            hoverIntensity={1.2} 
            rotateOnHover={true} 
            backgroundColor="#000000" 
          />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {customLogo ? (
              <img 
                src={customLogo} 
                alt="Logo" 
                className="w-32 h-32 mx-auto mb-8 drop-shadow-[0_0_30px_rgba(99,102,241,0.5)]"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-32 h-32 mx-auto mb-8 drop-shadow-[0_0_30px_rgba(236,72,153,0.5)]">
                <RobotLogo className="w-full h-full" />
              </div>
            )}

            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 leading-none">
              CODE <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">REVIEWER</span>
            </h1>
            
            <p className="text-base md:text-lg text-slate-400 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
              Elevate your code quality with AI-driven insights, automated rewrites, and real-time debugging assistance.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button
                onClick={() => onEnter('login')}
                className="group relative px-10 py-5 bg-white text-black font-black uppercase tracking-widest text-sm rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
              >
                <span className="relative z-10">Initialize Session</span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>

              <button
                onClick={() => onEnter('signup')}
                className="px-10 py-5 bg-transparent text-white font-black uppercase tracking-widest text-sm rounded-full border-2 border-white/20 hover:border-white/60 hover:bg-white/5 transition-all active:scale-95"
              >
                Create Identity
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-32 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6"
            >
              PROJECT <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">FEATURES</span>
            </motion.h2>
            <p className="text-slate-500 max-w-2xl mx-auto font-medium">
              Everything you need to build faster, cleaner, and more secure software with the power of advanced artificial intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-500"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white text-2xl mb-8 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                  <i className={`fas ${feature.icon}`}></i>
                </div>
                <h3 className="text-xl font-black text-white mb-4 tracking-tight uppercase">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed font-medium text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Decorative elements */}
      <div className="fixed top-0 left-0 w-full h-32 bg-gradient-to-b from-black to-transparent z-10 pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none"></div>
    </div>
  );
};
