// frontend/src/components/NeedMatrix.jsx

import React from 'react';
import { HelpCircle } from 'lucide-react';

function NeedMatrix({ needMatrix, numProcesses, numResources, isProcessing }) {
  
  const getResourceLabel = (idx) => String.fromCharCode(65 + idx);

  return (
    <div className="glass-panel p-6 flex flex-col gap-4 relative overflow-hidden">
      {/* Dynamic Purple/Cyan Decorator line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyberPurple to-transparent"></div>

      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-base text-slate-200">Need Matrix</h2>
          <span className="px-2 py-0.5 text-[9px] bg-cyberPurple/20 border border-cyberPurple/30 text-cyberPurple rounded font-bold uppercase tracking-wider">
            Auto-Calculated
          </span>
        </div>
        
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <span>Formula: Need = Max - Allocation</span>
        </div>
      </div>

      {isProcessing || !needMatrix || needMatrix.length === 0 ? (
        /* Skeleton / Loading state */
        <div className="w-full flex flex-col gap-2.5 py-6">
          <div className="h-6 w-full bg-slate-900/60 animate-pulse rounded-lg"></div>
          <div className="h-6 w-full bg-slate-900/60 animate-pulse rounded-lg"></div>
          <div className="h-6 w-full bg-slate-900/60 animate-pulse rounded-lg"></div>
        </div>
      ) : (
        <div className="overflow-x-auto border border-white/5 rounded-xl bg-slate-950/20">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-950/65 border-b border-white/5 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                <th className="px-4 py-3">Process</th>
                {Array(numResources).fill(0).map((_, rIdx) => (
                  <th key={rIdx} className="px-4 py-3 text-center">{getResourceLabel(rIdx)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {needMatrix.map((row, pIdx) => (
                <tr key={pIdx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-slate-300">P{pIdx}</td>
                  {row.map((val, rIdx) => (
                    <td key={rIdx} className="px-4 py-3.5 text-center font-extrabold text-sm text-cyberPurple">
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <p className="text-[10px] text-slate-500 leading-normal flex items-start gap-1.5 mt-1">
        <HelpCircle size={12} className="shrink-0 mt-0.5" />
        <span>
          The Need Matrix indicates the remaining resource units each process must request before it can execute and release its allocated resources.
        </span>
      </p>
    </div>
  );
}

export default NeedMatrix;
