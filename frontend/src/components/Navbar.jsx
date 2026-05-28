// frontend/src/components/Navbar.jsx

import React from 'react';
import { ShieldAlert, LogOut, RotateCcw, MessageSquareCode, RefreshCw } from 'lucide-react';

function Navbar({ onBack, onReset, onToggleChat, isInitializing }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Left Side: Brand Logo */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-cyberCyan/10 border border-cyberCyan/20 rounded-lg text-cyberCyan">
            <ShieldAlert size={20} className={isInitializing ? 'animate-bounce' : ''} />
          </div>
          <div>
            <h1 className="font-extrabold tracking-wide text-sm md:text-base bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
              DEADLOCK CONTROL
            </h1>
            <p className="text-[10px] text-cyberCyan font-semibold tracking-wider uppercase">
              AI Guardian System
            </p>
          </div>
        </div>

        {/* Right Side: Navigation & Simulation Controls */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Status Indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 bg-white/5 text-xs text-slate-400">
            {isInitializing ? (
              <>
                <RefreshCw size={12} className="animate-spin text-cyberCyan" />
                <span className="text-cyberCyan font-medium">Syncing State...</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>OS Kernel Connected</span>
              </>
            )}
          </div>

          {/* Reset Control */}
          <button
            onClick={onReset}
            title="Reset Simulation Matrices"
            className="flex items-center gap-2 px-3.5 py-2 border border-white/5 hover:border-white/15 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 transition-all text-xs active:scale-[0.98]"
          >
            <RotateCcw size={14} />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Chat Toggle Button */}
          <button
            onClick={onToggleChat}
            className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-cyberPurple/20 to-cyberCyan/20 border border-cyberCyan/30 hover:border-cyberCyan/60 hover:from-cyberPurple/30 hover:to-cyberCyan/30 rounded-xl text-cyberCyan transition-all text-xs font-semibold shadow-[0_0_10px_rgba(0,242,254,0.1)] active:scale-[0.98]"
          >
            <MessageSquareCode size={14} className="text-cyberCyan" />
            <span>AI Tutor Chat</span>
          </button>

          {/* Separation Line */}
          <div className="w-px h-6 bg-white/10 mx-1"></div>

          {/* Exit / Back button */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3.5 py-2 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 rounded-xl text-slate-400 hover:text-rose-400 transition-all text-xs active:scale-[0.98]"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Exit</span>
          </button>

        </div>

      </div>
    </header>
  );
}

export default Navbar;
