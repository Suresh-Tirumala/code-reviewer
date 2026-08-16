import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { RobotLogo } from './RobotLogo';
import { motion, AnimatePresence } from 'motion/react';

interface LoginProps {
  onLogin: (user: User) => void;
  customLogo: string | null;
  initialMode?: 'login' | 'signup';
}

interface StoredUser extends User {
  password: string;
}

export const Login: React.FC<LoginProps> = ({ onLogin, customLogo, initialMode = 'login' }) => {
  const [isSignup, setIsSignup] = useState(initialMode === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  // Clear fields and error when switching modes
  useEffect(() => {
    setError('');
    setPassword('');
    // Optionally clear other fields, but keeping email might be nice
  }, [isSignup]);

  const getUsers = (): StoredUser[] => {
    const data = localStorage.getItem('codeagent_users');
    return data ? JSON.parse(data) : [];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const users = getUsers();

    if (isSignup) {
      if (!email || !password || !name) {
        setError('All fields are mandatory for registration.');
        return;
      }
      if (users.some(u => u.email === email)) {
        setError('This email is already registered.');
        return;
      }
      
      const newUser: StoredUser = { 
        email, 
        password, 
        name, 
        role: 'Senior Software Engineer' 
      };
      
      const updatedUsers = [...users, newUser];
      localStorage.setItem('codeagent_users', JSON.stringify(updatedUsers));
      onLogin({ email, name, role: newUser.role });
    } else {
      if (!email || !password) {
        setError('Please enter your credentials.');
        return;
      }

      const user = users.find(u => u.email === email);
      
      if (!user) {
        setError('No account found with this email. Please sign up.');
        return;
      }
      
      if (user.password !== password) {
        setError('Incorrect password. Please verify your credentials.');
        return;
      }

      onLogin({ 
        email: user.email, 
        name: user.name,
        role: user.role
      });
    }
  };

  const variants = {
    initial: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
      filter: 'blur(4px)'
    }),
    animate: {
      x: 0,
      opacity: 1,
      filter: 'blur(0px)',
      transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
      filter: 'blur(4px)',
      transition: { duration: 0.2, ease: [0.4, 0, 1, 1] as [number, number, number, number] }
    })
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 relative overflow-hidden font-sans">
      
      {/* Subtle Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'circOut' }}
        className="w-full max-w-[420px] relative z-10"
      >
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col rounded-3xl p-8">
          
          <div className="relative text-center mb-8 flex flex-col items-center">
            <div className="h-16 w-16 bg-zinc-800/50 rounded-2xl flex items-center justify-center text-zinc-100 mb-4 shadow-inner border border-zinc-700/50 overflow-hidden">
              {customLogo ? (
                <img 
                  src={customLogo} 
                  alt="Logo" 
                  className="w-full h-full object-cover p-1.5" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <RobotLogo className="w-full h-full p-2" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h2>
            <p className="mt-1.5 text-sm text-zinc-400 font-medium">Continue to your Coding Agent</p>
          </div>

          <div className="flex p-1 bg-zinc-950/50 rounded-xl mb-8 border border-zinc-800/50">
            <button
              type="button"
              onClick={() => setIsSignup(false)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                !isSignup 
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/50' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => setIsSignup(true)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                isSignup 
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/50' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Sign Up
            </button>
          </div>

          <AnimatePresence mode="popLayout" initial={false} custom={isSignup ? 1 : -1}>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-semibold flex items-center gap-3">
                  <i className="fas fa-circle-exclamation"></i>
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form className="relative" onSubmit={handleSubmit}>
            <AnimatePresence mode="wait" custom={isSignup ? 1 : -1}>
              <motion.div
                key={isSignup ? 'signup' : 'login'}
                custom={isSignup ? 1 : -1}
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-4"
              >
                {isSignup && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400 pl-1">Full Name</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
                        <i className="fas fa-user text-sm"></i>
                      </div>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-zinc-950/80 border border-zinc-800 text-white rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-zinc-600 text-sm outline-none"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 pl-1">Email Address</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
                      <i className="fas fa-envelope text-sm"></i>
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-zinc-950/80 border border-zinc-800 text-white rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-zinc-600 text-sm outline-none"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 pl-1">Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
                      <i className="fas fa-lock text-sm"></i>
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-zinc-950/80 border border-zinc-800 text-white rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-zinc-600 text-sm outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-lg text-sm font-bold text-white bg-white/10 hover:bg-white/15 border border-white/5 hover:border-white/10 transition-all active:scale-[0.98]"
                  >
                    {isSignup ? 'Create Account' : 'Sign In'}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </form>

        </div>
      </motion.div>
    </div>
  );
};
