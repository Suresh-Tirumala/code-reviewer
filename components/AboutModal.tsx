import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Code, Zap, Shield, Cpu } from 'lucide-react';
import { RobotLogo } from './RobotLogo';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="p-8 md:p-12">
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center overflow-hidden border border-white/10">
                  <RobotLogo className="w-full h-full p-1.5" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">AI CODE REVIEWER</h2>
                  <p className="text-indigo-400 font-bold text-xs uppercase tracking-widest">Version 1.0.0</p>
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-slate-300 leading-relaxed">
                  AI Code Reviewer is a next-generation development assistant designed to bridge the gap between raw code and production-ready excellence. It provides deep structural analysis, security auditing, and automated refactoring to ensure your codebase remains robust and efficient.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                      <Zap size={18} className="text-amber-400" />
                      <h3 className="font-bold text-white text-sm">Real-time Analysis</h3>
                    </div>
                    <p className="text-xs text-slate-400">Instant feedback on code quality, performance bottlenecks, and potential bugs.</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                      <Code size={18} className="text-cyan-400" />
                      <h3 className="font-bold text-white text-sm">AI Refactoring</h3>
                    </div>
                    <p className="text-xs text-slate-400">One-click rewrites to improve readability, maintainability, and modern standards.</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                      <Shield size={18} className="text-emerald-400" />
                      <h3 className="font-bold text-white text-sm">Security Audit</h3>
                    </div>
                    <p className="text-xs text-slate-400">Deep scanning for vulnerabilities, hardcoded secrets, and insecure patterns.</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                      <Cpu size={18} className="text-indigo-400" />
                      <h3 className="font-bold text-white text-sm">Advanced Intelligence</h3>
                    </div>
                    <p className="text-xs text-slate-400">Leveraging state-of-the-art neural networks for unparalleled reasoning and code comprehension.</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                  <div className="flex gap-4">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Built for Developers</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Secure by Design</span>
                  </div>
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-white text-black text-xs font-black uppercase rounded-full hover:scale-105 transition-transform"
                  >
                    Got it
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
