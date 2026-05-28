// frontend/src/pages/Home.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, ShieldCheck, Binary, Sparkles, ArrowRight, Lock } from 'lucide-react';

function Home({ onStart }) {
  // Animation presets
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 80 } }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-16 relative overflow-hidden select-none">
      {/* Background Neon Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyberCyan/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyberPurple/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      {/* Hero Section Container */}
      <motion.div 
        className="max-w-4xl w-full text-center relative z-10 flex flex-col items-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Floating OS badge */}
        <motion.div 
          className="flex items-center gap-2 px-4 py-2 border border-cyberCyan/30 rounded-full bg-slate-900/60 backdrop-blur-cyber text-cyberCyan text-xs font-semibold mb-8 shadow-[0_0_15px_rgba(0,242,254,0.15)]"
          variants={itemVariants}
        >
          <Cpu size={14} className="animate-spin-slow" />
          <span>OPERATING SYSTEMS SIMULATOR</span>
        </motion.div>

        {/* Title */}
        <motion.h1 
          className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400"
          variants={itemVariants}
        >
          AI-Powered Deadlock <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyberCyan to-cyberPurple text-glow-cyan">
            Detection & Prevention
          </span>
        </motion.h1>

        {/* Subtitle description */}
        <motion.p 
          className="text-slate-400 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed"
          variants={itemVariants}
        >
          An interactive, high-fidelity simulator for operating systems education. 
          Configure resource vectors, simulate allocation requests using the "Banker's Algorithm" .
        </motion.p>

        {/* Action Button */}
        <motion.div variants={itemVariants} className="mb-20">
          <button
            onClick={onStart}
            className="group relative px-8 py-4 bg-gradient-to-r from-cyberCyan to-cyberPurple text-darkBg font-bold text-lg rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,242,254,0.6)] transform hover:scale-[1.03] flex items-center gap-3 active:scale-[0.98]"
          >
            <span>Start Simulation</span>
            <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>

        {/* Showcase Feature Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left"
          variants={itemVariants}
        >
          {/* Card 1 */}
          <div className="glass-panel p-6 hover:border-cyberCyan/30 transition-all duration-300 group">
            <div className="p-3 bg-cyberCyan/10 rounded-lg text-cyberCyan w-fit mb-4 group-hover:scale-110 transition-transform">
              <Binary size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">Banker's Engine</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Dynamically computes Need matrices and runs safety sweeps to find valid process orderings.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel p-6 hover:border-cyberCyan/30 transition-all duration-300 group">
            <div className="p-3 bg-cyberPurple/10 rounded-lg text-cyberPurple w-fit mb-4 group-hover:scale-110 transition-transform">
              <Sparkles size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">Gemini AI Tutor</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Provides auto-explanations for resource allocations and answers operating system questions in real-time.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel p-6 hover:border-cyberCyan/30 transition-all duration-300 group">
            <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400 w-fit mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">Deadlock Prevention</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Checks state safety in advance and rolls back unsafe allocations automatically to keep the simulator running.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Home;
