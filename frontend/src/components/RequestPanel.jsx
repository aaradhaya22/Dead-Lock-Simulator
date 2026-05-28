// frontend/src/components/RequestPanel.jsx

import React, { useState, useEffect } from 'react';
import { Play, ArrowRight, HelpCircle } from 'lucide-react';

function RequestPanel({ 
  numProcesses, 
  numResources, 
  available, 
  needMatrix, 
  onRequestSubmit, 
  isRequesting 
}) {
  const [selectedProcess, setSelectedProcess] = useState(0);
  const [requestVector, setRequestVector] = useState([]);
  const [warning, setWarning] = useState('');

  // Reset request vector when process selection or resource count changes
  useEffect(() => {
    if (numResources > 0) {
      setRequestVector(Array(numResources).fill(0));
    }
    setWarning('');
  }, [selectedProcess, numResources]);

  // Handle cell request input edits
  const handleCellChange = (rIdx, value) => {
    const newVal = parseInt(value) || 0;
    const updated = [...requestVector];
    updated[rIdx] = newVal >= 0 ? newVal : 0;
    setRequestVector(updated);
    setWarning('');
  };

  // Pre-fill maximum remaining need values for selected process
  const handleFillMaxNeed = () => {
    if (needMatrix && needMatrix[selectedProcess]) {
      setRequestVector([...needMatrix[selectedProcess]]);
    }
  };

  // Form submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    setWarning('');

    // Check request vector sizes
    if (requestVector.length !== numResources) {
      setWarning('Invalid request dimension size.');
      return;
    }

    // Check if any element is negative
    if (requestVector.some(val => val < 0)) {
      setWarning('Requests cannot contain negative values.');
      return;
    }

    // Ensure they are not all 0 (meaningless request)
    if (requestVector.every(val => val === 0)) {
      setWarning('Please request at least 1 resource unit.');
      return;
    }

    // Frontend defensive check: Request <= Need
    if (needMatrix && needMatrix[selectedProcess]) {
      const processNeed = needMatrix[selectedProcess];
      for (let r = 0; r < numResources; r++) {
        if (requestVector[r] > processNeed[r]) {
          setWarning(
            `Invalid Request: Process P${selectedProcess} requested ${requestVector[r]} units of ${getResourceLabel(r)}, which exceeds its remaining declared Need of ${processNeed[r]}.`
          );
          return;
        }
      }
    }

    // Frontend warning: Request <= Available (Note: we still allow submitting to see the backend deny message)
    if (available) {
      for (let r = 0; r < numResources; r++) {
        if (requestVector[r] > available[r]) {
          setWarning(
            `Process P${selectedProcess} will wait: Requesting ${requestVector[r]} units of ${getResourceLabel(r)}, which exceeds current Availability (${available[r]}).`
          );
          // Let it proceed to backend so the engine runs its formal Banker logic
        }
      }
    }

    onRequestSubmit(selectedProcess, requestVector);
  };

  const getResourceLabel = (idx) => String.fromCharCode(65 + idx);

  return (
    <div className="glass-panel p-6 flex flex-col gap-4 relative overflow-hidden">
      {/* Red/Amber accent bar */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-400 to-transparent"></div>

      <h2 className="font-bold text-base text-slate-200">Submit Resource Request</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        {/* Dropdown process selection */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Select Process
          </label>
          <select
            value={selectedProcess}
            onChange={(e) => setSelectedProcess(parseInt(e.target.value))}
            disabled={isRequesting}
            className="w-full bg-slate-950 border border-white/10 hover:border-white/20 focus:border-cyberCyan/40 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
          >
            {Array(numProcesses).fill(0).map((_, idx) => (
              <option key={idx} value={idx}>Process P{idx}</option>
            ))}
          </select>
        </div>

        {/* Vector vector inputs */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Request Vector
            </label>
            <button
              type="button"
              onClick={handleFillMaxNeed}
              disabled={isRequesting}
              className="text-[10px] text-cyberCyan hover:underline font-semibold"
            >
              Fill Remaining Need
            </button>
          </div>

          <div className="flex gap-2 flex-wrap">
            {requestVector.map((val, rIdx) => (
              <div key={rIdx} className="flex-1 min-w-[70px] flex items-center bg-slate-950 border border-white/10 rounded-xl px-2.5 py-1.5">
                <span className="text-[10px] text-slate-400 font-bold mr-1.5">{getResourceLabel(rIdx)}</span>
                <input
                  type="number"
                  min="0"
                  value={val}
                  onChange={(e) => handleCellChange(rIdx, e.target.value)}
                  disabled={isRequesting}
                  className="bg-transparent text-slate-100 text-sm font-extrabold w-full text-right focus:outline-none focus:text-cyberCyan"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Local warning notes */}
        {warning && (
          <div className="text-[10px] p-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-300">
            {warning}
          </div>
        )}

        {/* Submit action */}
        <button
          type="submit"
          disabled={isRequesting}
          className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 hover:border-cyberCyan/40 hover:bg-cyberCyan/15 text-slate-200 hover:text-cyberCyan font-bold text-xs rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {isRequesting ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-cyberCyan border-t-transparent rounded-full animate-spin"></div>
              <span>Processing Request...</span>
            </>
          ) : (
            <>
              <Play size={12} fill="currentColor" />
              <span>Request Allocation</span>
            </>
          )}
        </button>

      </form>
    </div>
  );
}

export default RequestPanel;
