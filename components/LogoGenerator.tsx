
import React, { useState } from 'react';
import { generateRobotLogo } from '../services/logoService';

interface LogoGeneratorProps {
  onLogoGenerated: (logoUrl: string) => void;
  currentLogo?: string;
}

export const LogoGenerator: React.FC<LogoGeneratorProps> = ({ onLogoGenerated, currentLogo }) => {
  const [prompt, setPrompt] = useState("A professional, sleek, modern robot logo for a coding assistant platform. Minimalist, high-tech, vector style, clean lines, professional color palette (indigo, slate, white), high resolution, 1:1 aspect ratio.");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentLogo || null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const logoUrl = await generateRobotLogo(prompt);
      setPreview(logoUrl);
      onLogoGenerated(logoUrl);
    } catch (error) {
      console.error(error);
      alert("Failed to generate logo. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 bg-white rounded-2xl border border-slate-200 flex items-center justify-center overflow-hidden shadow-inner">
          {preview ? (
            <img src={preview} alt="Logo Preview" className="w-full h-full object-cover" />
          ) : (
            <i className="fas fa-robot text-3xl text-slate-300"></i>
          )}
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Identity Synthesis</h4>
          <p className="text-[10px] text-slate-500 font-medium">Generate a professional robot logo using AI</p>
        </div>
      </div>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="w-full p-3 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[80px]"
        placeholder="Describe your ideal robot logo..."
      />

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <i className="fas fa-circle-notch animate-spin"></i>
            Synthesizing...
          </>
        ) : (
          <>
            <i className="fas fa-wand-magic-sparkles"></i>
            Generate New Logo
          </>
        )}
      </button>
    </div>
  );
};
