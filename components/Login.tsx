
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import Antigravity from './Antigravity';
import { RobotLogo } from './RobotLogo';

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

  // Clear error when switching modes
  useEffect(() => {
    setError('');
  }, [isSignup]);

  const getUsers = (): StoredUser[] => {
    const data = localStorage.getItem('codeagent_users');
    return data ? JSON.parse(data) : [];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const users = getUsers();
    console.debug(`[Auth] Attempting ${isSignup ? 'Signup' : 'Login'} for ${email}`);

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
      console.debug(`[Auth] Registered new user: ${email}`);
      onLogin({ email, name, role: newUser.role });
    } else {
      if (!email || !password) {
        setError('Please enter your credentials.');
        return;
      }

      const user = users.find(u => u.email === email);
      
      if (!user) {
        console.warn(`[Auth] Login failed: User ${email} not found in local records.`);
        setError('No account found with this email. Please sign up.');
        return;
      }
      
      if (user.password !== password) {
        console.warn(`[Auth] Login failed: Incorrect password for ${email}.`);
        setError('Incorrect password. Please verify your credentials.');
        return;
      }

      console.debug(`[Auth] Login successful for: ${email}`);
      onLogin({ 
        email: user.email, 
        name: user.name,
        role: user.role
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4 perspective-1000 relative overflow-hidden">
      <Antigravity 
        color="#6366f1" 
        count={400} 
        magnetRadius={15} 
        ringRadius={12} 
        particleSize={1.5}
        autoAnimate={true}
      />
      
      <div 
        className={`relative z-10 w-full max-w-md flip-transition preserve-3d ${isSignup ? 'rotate-y-180' : ''}`}
        style={{ minHeight: '600px' }}
      >
        
        {/* FRONT FACE: SIGN IN */}
        <div className="absolute inset-0 backface-hidden w-full h-full bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden flex flex-col justify-center">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative text-center mb-8">
            <div className="mx-auto h-20 w-20 bg-white/5 rounded-2xl flex items-center justify-center text-3xl text-white mb-6 shadow-xl border border-white/10 overflow-hidden">
              {customLogo ? (
                <img 
                  src={customLogo} 
                  alt="Logo" 
                  className="w-full h-full object-cover p-2" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <RobotLogo className="w-full h-full p-2" />
              )}
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight uppercase">CODING AGENT</h2>
            <p className="mt-2 text-sm text-slate-400 font-medium tracking-tight">Login with your registered credentials</p>
          </div>

          {error && !isSignup && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold flex items-center gap-3 animate-in fade-in zoom-in-95">
              <i className="fas fa-circle-exclamation"></i>
              {error}
            </div>
          )}

          <form className="relative space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Email Access</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-800/50 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-600 text-sm"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <i className="fas fa-lock"></i>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-800/50 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-800 text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all hover:-translate-y-0.5 shadow-indigo-600/20"
            >
              <i className="fas fa-sign-in-alt mr-2"></i> 
              Initialize Session
            </button>

            <div className="text-center">
              <button 
                type="button"
                onClick={() => setIsSignup(true)}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest"
              >
                Request New Account
              </button>
            </div>
          </form>
        </div>

        {/* BACK FACE: SIGN UP */}
        <div className="absolute inset-0 backface-hidden w-full h-full bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl rotate-y-180 overflow-hidden flex flex-col justify-center">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-3xl text-white mb-6 shadow-xl shadow-emerald-600/20">
              <i className="fas fa-user-plus"></i>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Create Account</h2>
            <p className="mt-2 text-sm text-slate-400 font-medium">Register for professional code analysis</p>
          </div>

          {error && isSignup && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold flex items-center gap-3 animate-in fade-in zoom-in-95">
              <i className="fas fa-circle-exclamation"></i>
              {error}
            </div>
          )}

          <form className="relative space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Identity</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <i className="fas fa-user"></i>
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-800/50 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-slate-600 text-sm"
                    placeholder="Full Name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-800/50 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-slate-600 text-sm"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <i className="fas fa-lock"></i>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-800/50 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-slate-600 text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 transition-all hover:-translate-y-0.5 shadow-emerald-600/20"
            >
              Register & Start
            </button>

            <div className="text-center">
              <button 
                type="button"
                onClick={() => setIsSignup(false)}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-widest"
              >
                Already registered? Sign in
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};
