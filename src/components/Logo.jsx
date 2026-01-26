import React from 'react';
import { Sparkles } from 'lucide-react';

export default function Logo({ size = 'default' }) {
  const sizes = {
    small: { container: 'h-8', text: 'text-lg', icon: 'w-4 h-4', iconContainer: 'w-6 h-6' },
    default: { container: 'h-10', text: 'text-xl', icon: 'w-5 h-5', iconContainer: 'w-8 h-8' },
    large: { container: 'h-16', text: 'text-3xl', icon: 'w-8 h-8', iconContainer: 'w-12 h-12' }
  };

  const s = sizes[size];

  return (
    <div className={`flex items-center gap-2 ${s.container}`}>
      {/* Logo Icon - Connector Style */}
      <div className={`${s.iconContainer} bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center relative`}>
        {/* Connection dots */}
        <div className="absolute inset-0 flex items-center justify-between px-1">
          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
        </div>
        {/* Center sparkle/connector */}
        <Sparkles className={`${s.icon} text-white`} />
      </div>
      
      {/* Text with connector styling */}
      <div className={`${s.text} font-semibold text-slate-900 flex items-center`}>
        <span>Work</span>
        <span className="inline-flex items-center">
          <svg 
            className="w-3 h-3 mx-0.5 text-indigo-600" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3"
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="2" fill="currentColor" />
            <line x1="4" y1="12" x2="9" y2="12" />
            <line x1="15" y1="12" x2="20" y2="12" />
          </svg>
        </span>
        <span>flow AI</span>
      </div>
    </div>
  );
}