import React from 'react';
import { motion } from 'motion/react';

interface RobotLogoProps {
  className?: string;
}

export const RobotLogo: React.FC<RobotLogoProps> = ({ className = "w-12 h-12" }) => {
  return (
    <motion.svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      initial="initial"
      animate="animate"
    >
      <defs>
        <linearGradient id="robot-gradient" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#FF3B5C" />
          <stop offset="100%" stopColor="#8A2BE2" />
        </linearGradient>
      </defs>
      
      {/* Antenna */}
      <motion.g
        animate={{ 
          rotate: [0, -5, 5, -5, 0],
          transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }}
        style={{ transformOrigin: '50% 25px' }}
      >
        <motion.circle 
          cx="50" cy="10" r="4.5" fill="#FF3B5C" 
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <rect x="47.5" y="14" width="5" height="10" rx="2.5" fill="#FF3B5C" />
      </motion.g>
      
      {/* Head Group - Floating */}
      <motion.g
        animate={{ 
          y: [0, -3, 0],
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      >
        {/* Ears */}
        <rect x="10" y="42" width="7" height="18" rx="3.5" fill="#8A2BE2" />
        <rect x="83" y="42" width="7" height="18" rx="3.5" fill="#FF3B5C" />
        
        {/* Head Main Body */}
        <rect x="20" y="28" width="60" height="45" rx="20" fill="url(#robot-gradient)" />
        
        {/* Face Inset (White Area) */}
        <path 
          d="M30 38C30 35.5 32 33.5 34.5 33.5H65.5C68 33.5 70 35.5 70 38V46C70 48.5 68 50.5 65.5 50.5H52C51 50.5 50.5 51 50 52C49.5 51 49 50.5 48 50.5H34.5C32 50.5 30 48.5 30 46V38Z" 
          fill="white" 
        />
        
        {/* Eyes (Smiling Arcs) */}
        <path 
          d="M38 43C38 41.5 40 40.5 43 40.5C46 40.5 48 41.5 48 43" 
          stroke="#8A2BE2" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
        />
        <path 
          d="M52 43C52 41.5 54 40.5 57 40.5C60 40.5 62 41.5 62 43" 
          stroke="#8A2BE2" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
        />
      </motion.g>
      
      {/* Chin / Bottom Shape */}
      <motion.path 
        d="M38 78C38 78 42 92 50 92C58 92 62 78 62 78C62 78 58 74 50 74C42 74 38 78 38 78Z" 
        fill="#8A2BE2" 
        animate={{ 
          y: [0, 2, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        style={{ transformOrigin: '50% 80px' }}
      />
    </motion.svg>
  );
};
