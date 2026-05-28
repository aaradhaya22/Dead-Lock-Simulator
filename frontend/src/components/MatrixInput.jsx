// frontend/src/components/MatrixInput.jsx

import React, { useState, useEffect } from 'react';
import { Settings, Save, Check } from 'lucide-react';

function MatrixInput({ 
  numProcesses, 
  numResources, 
  available, 
  maxMatrix, 
  allocMatrix, 
  onConfigure, 
  onSave, 
  isProcessing 
}) {
  // Local states for editing before saving
  const [localProcesses, setLocalProcesses] = useState(numProcesses);
  const [localResources, setLocalResources] = useState(numResources);
  
  const [localAvailable, setLocalAvailable] = useState([]);
  const [localMax, setLocalMax] = useState([]);
  const [localAlloc, setLocalAlloc] = useState([]);
  
  const [valErrors, setValErrors] = useState('');

  // Sync with incoming props (e.g. on default loads, cache loads, or reconfigurations)
  useEffect(() => {
    setLocalProcesses(numProcesses);
    setLocalResources(numResources);
    setLocalAvailable([...available]);
    setLocalMax(maxMatrix.map(row => [...row]));
    setLocalAlloc(allocMatrix.map(row => [...row]));
    setValErrors('');
  }, [numProcesses, numResources, available, maxMatrix, allocMatrix]);

  // Handle available vector edits
  const handleAvailableChange = (rIdx, value) => {
    const newVal = parseInt(value) || 0;
    const updated = [...localAvailable];
    updated[rIdx] = newVal >= 0 ? newVal : 0;
    setLocalAvailable(updated);
  };

  // Handle Max matrix edits
  const handleMaxChange = (pIdx, rIdx, value) => {
    const newVal = parseInt(value) || 0;
    const updated = localMax.map((row, idx) => 
      idx === pIdx ? row.map((val, r) => (r === rIdx ? (newVal >= 0 ? newVal : 0) : val)) : [...row]
    );
    setLocalMax(updated);
  };

  // Handle Allocation matrix edits
  const handleAllocChange = (pIdx, rIdx, value) => {
    const newVal = parseInt(value) || 0;
    const updated = localAlloc.map((row, idx) => 
      idx === pIdx ? row.map((val, r) => (r === rIdx ? (newVal >= 0 ? newVal : 0) : val)) : [...row]
    );
    setLocalAlloc(updated);
  };

  // Run dimensions configure update
  const handleApplyConfig = (e) => {
    e.preventDefault();
    if (localProcesses < 1 || localProcesses > 10 || localResources < 1 || localResources > 10) {
      setValErrors('Dimensions must be between 1 and 10 for simulation stability.');
      return;
    }
    setValErrors('');
    onConfigure(localProcesses, localResources);
  };

  // Validate matrix cell values and call parent save
  const handleCommitSave = () => {
    setValErrors('');
    
    // 1. Validate negative inputs
    if (localAvailable.some(x => x < 0)) {
      setValErrors('Available resources cannot contain negative values.');
      return;
    }
    
    for (let p = 0; p < numProcesses; p++) {
      for (let r = 0; r < numResources; r++) {
        if (localMax[p][r] < 0 || localAlloc[p][r] < 0) {
          setValErrors('Matrix cell entries cannot be negative.');
          return;
        }
        // 2. Validate Alloc <= Max condition
        if (localAlloc[p][r] > localMax[p][r]) {
          setValErrors(`Invalid Allocation: P${p} has ${localAlloc[p][r]} allocated for resource R${r}, which exceeds its declared Maximum claim of ${localMax[p][r]}.`);
          return;
        }
      }
    }

    onSave(localAvailable, localMax, localAlloc);
  };

  // Helper labels for resources (A, B, C...)
  const getResourceLabel = (idx) => String.fromCharCode(65 + idx);

  return (
    <div className="glass-panel p-6 flex flex-col gap-6 relative overflow-hidden">
      {/* Decorative Cyan Gradient Bar */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyberCyan to-transparent"></div>

      {/* Grid Configuration Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div className="flex items-center gap-2 text-slate-200">
          <Settings size={18} className="text-cyberCyan" />
          <h2 className="font-bold text-base">System Configuration</h2>
        </div>
        
        {/* Dimensions configuration form */}
        <form onSubmit={handleApplyConfig} className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-950/60 border border-white/5 rounded-lg px-2.5 py-1.5">
            <label className="text-[10px] text-slate-400 font-semibold uppercase">P:</label>
            <input
              type="number"
              min="1"
              max="10"
              value={localProcesses}
              onChange={(e) => setLocalProcesses(parseInt(e.target.value) || '')}
              className="bg-transparent text-slate-100 w-8 text-center text-xs font-bold focus:outline-none"
            />
          </div>
          
          <div className="flex items-center gap-1.5 bg-slate-950/60 border border-white/5 rounded-lg px-2.5 py-1.5">
            <label className="text-[10px] text-slate-400 font-semibold uppercase">R:</label>
            <input
              type="number"
              min="1"
              max="10"
              value={localResources}
              onChange={(e) => setLocalResources(parseInt(e.target.value) || '')}
              className="bg-transparent text-slate-100 w-8 text-center text-xs font-bold focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="px-3.5 py-2 bg-white/5 border border-white/10 hover:border-cyberCyan/40 hover:bg-cyberCyan/10 text-slate-200 hover:text-cyberCyan rounded-xl text-xs transition-all active:scale-[0.98] disabled:opacity-50"
          >
            Apply Dimensions
          </button>
        </form>
      </div>

      {/* Available Resources Vector Vector input */}
      <div className="bg-slate-950/40 border border-white/5 rounded-xl p-4 flex flex-col gap-3">
        <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
          Available Resources Vector (Free Pool)
        </h3>
        <div className="flex gap-3 flex-wrap">
          {localAvailable.map((val, rIdx) => (
            <div key={rIdx} className="flex items-center gap-2 bg-slate-950/70 border border-white/5 rounded-lg px-3 py-1.5 w-24">
              <span className="text-xs text-cyberCyan font-bold">{getResourceLabel(rIdx)}</span>
              <input
                type="number"
                min="0"
                value={val}
                onChange={(e) => handleAvailableChange(rIdx, e.target.value)}
                className="bg-transparent text-slate-100 w-full text-right text-sm font-bold focus:outline-none focus:text-cyberCyan"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Matrices Grid Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* C. Maximum Matrix dynamic table */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
              Max Matrix (P x R)
            </h3>
            <span className="text-[10px] text-slate-500">Maximum claimed need</span>
          </div>
          <div className="overflow-x-auto border border-white/5 rounded-xl bg-slate-950/20">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-950/65 border-b border-white/5 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="px-3 py-2">Process</th>
                  {Array(numResources).fill(0).map((_, rIdx) => (
                    <th key={rIdx} className="px-3 py-2 text-center">{getResourceLabel(rIdx)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {localMax.map((row, pIdx) => (
                  <tr key={pIdx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-3 py-2 font-bold text-slate-300">P{pIdx}</td>
                    {row.map((val, rIdx) => (
                      <td key={rIdx} className="px-2 py-1.5 text-center">
                        <input
                          type="number"
                          min="0"
                          value={val}
                          onChange={(e) => handleMaxChange(pIdx, rIdx, e.target.value)}
                          className="bg-slate-950/60 border border-white/5 rounded w-12 py-1 text-center font-bold focus:border-cyberCyan/40 focus:outline-none text-slate-200"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* D. Allocation Matrix Input dynamic table */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
              Allocation Matrix (P x R)
            </h3>
            <span className="text-[10px] text-slate-500">Currently allocated</span>
          </div>
          <div className="overflow-x-auto border border-white/5 rounded-xl bg-slate-950/20">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-950/65 border-b border-white/5 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="px-3 py-2">Process</th>
                  {Array(numResources).fill(0).map((_, rIdx) => (
                    <th key={rIdx} className="px-3 py-2 text-center">{getResourceLabel(rIdx)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {localAlloc.map((row, pIdx) => (
                  <tr key={pIdx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-3 py-2 font-bold text-slate-300">P{pIdx}</td>
                    {row.map((val, rIdx) => (
                      <td key={rIdx} className="px-2 py-1.5 text-center">
                        <input
                          type="number"
                          min="0"
                          value={val}
                          onChange={(e) => handleAllocChange(pIdx, rIdx, e.target.value)}
                          className="bg-slate-950/60 border border-white/5 rounded w-12 py-1 text-center font-bold focus:border-cyberCyan/40 focus:outline-none text-slate-200"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Validation Error Banner inside panel */}
      {valErrors && (
        <div className="text-xs p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
          ⚠️ {valErrors}
        </div>
      )}

      {/* Action Trigger Buttons */}
      <div className="flex justify-end gap-3 mt-2">
        <button
          onClick={handleCommitSave}
          disabled={isProcessing}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyberCyan to-cyberPurple hover:shadow-[0_0_15px_rgba(0,242,254,0.35)] text-darkBg font-bold text-xs rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-darkBg border-t-transparent rounded-full animate-spin"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Save size={14} />
              <span>Commit & Calculate</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}

export default MatrixInput;
