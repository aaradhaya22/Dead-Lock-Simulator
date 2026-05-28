// frontend/src/components/StatusCard.jsx

import React from 'react';
import { ShieldCheck, ShieldAlert, Terminal, Play, RefreshCw } from 'lucide-react';

function StatusCard({ isSafe, safeSequence, logs, onRunCheck, isChecking }) {
  
  return (
    <div className="glass-panel p-6 flex flex-col gap-4 relative overflow-hidden">
      {/* Dynamic top safety bar indicator */}
      <div 
        className={`absolute top-0 left-0 w-full h-[2px] transition-all duration-500 ${
          isSafe ? 'bg-emerald-400' : 'bg-rose-500'
        }`}
      ></div>

      {/* Safety Status display block */}
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-base text-slate-200">System Safety Status</h2>
        <span className="text-[10px] text-slate-500">Real-time Telemetry</span>
      </div>

      <div className="flex items-center gap-4 py-2 border-b border-white/5 pb-4">
        {/* Large Glowing Icon */}
        <div className={`p-4 rounded-2xl shrink-0 transition-all duration-500 ${
          isSafe 
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
            : 'bg-rose-500/10 border border-rose-500/20 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
        }`}>
          {isSafe ? <ShieldCheck size={28} /> : <ShieldAlert size={28} />}
        </div>
        
        {/* State Label */}
        <div>
          <div className="flex items-center gap-1.5">
            <span className={`text-lg font-extrabold uppercase tracking-wide transition-colors duration-500 ${
              isSafe ? 'text-emerald-400 text-glow-green' : 'text-rose-400 text-glow-red'
            }`}>
              {isSafe ? 'Safe State' : 'Unsafe State'}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
            {isSafe 
              ? 'All processes can finish without deadlocks.' 
              : 'Safety path unavailable. Risk of circular wait.'}
          </p>
        </div>
      </div>

      {/* Terminal logs list */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
          <Terminal size={12} className="text-slate-500" />
          <span>Kernel Log Console</span>
        </div>
        
        <div className="h-32 bg-slate-950 border border-white/5 rounded-xl p-3 font-mono text-[10px] text-slate-400 overflow-y-auto flex flex-col gap-2">
          {logs && logs.length > 0 ? (
            logs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-1.5 leading-relaxed">
                <span className="text-slate-600 shrink-0 font-sans font-bold">[{log.time}]</span>
                <span className={`font-semibold shrink-0 uppercase ${
                  log.type === 'success' ? 'text-emerald-500' :
                  log.type === 'warning' ? 'text-amber-500' :
                  log.type === 'danger' ? 'text-rose-500' : 'text-cyberCyan'
                }`}>
                  {log.type === 'info' ? '>>' : log.type}:
                </span>
                <span className="break-all">{log.text}</span>
              </div>
            ))
          ) : (
            <div className="text-slate-600 text-center py-8">Log screen empty.</div>
          )}
        </div>
      </div>

      {/* Action button */}
      <button
        onClick={onRunCheck}
        disabled={isChecking}
        className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 hover:border-cyberCyan/40 hover:bg-cyberCyan/15 text-slate-200 hover:text-cyberCyan font-bold text-xs rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
      >
        {isChecking ? (
          <>
            <RefreshCw size={12} className="animate-spin text-cyberCyan" />
            <span>Verifying Kernal Safety...</span>
          </>
        ) : (
          <>
            <Play size={12} fill="currentColor" />
            <span>Verify System Safety</span>
          </>
        )}
      </button>

    </div>
  );
}

export default StatusCard;
