// frontend/src/components/SafeSequence.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertOctagon, ChevronRight, Cpu } from 'lucide-react';

function SafeSequence({ sequence, isSafe, isProcessing }) {

  // Animation container configurations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  return (
    <div className="glass-panel p-6 flex flex-col gap-4 relative overflow-hidden">

      {/* Dynamic top indicator */}
      <div
        className={`absolute top-0 left-0 w-full h-[2px] transition-colors duration-300 ${
          isSafe
            ? 'bg-gradient-to-r from-emerald-500 to-transparent'
            : 'bg-gradient-to-r from-rose-500 to-transparent'
        }`}
      ></div>

      {/* Header */}
      <h2 className="font-bold text-base text-slate-200 flex items-center gap-2">
        <Cpu
          size={18}
          className={isSafe ? 'text-emerald-400' : 'text-rose-400'}
        />
        <span>Execution Safe Sequence</span>
      </h2>

      {/* Loading State */}
      {isProcessing ? (
        <div className="w-full py-8 flex items-center justify-center gap-3">
          <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-slate-400">
            Recalculating safe sequence...
          </span>
        </div>

      ) : !isSafe ? (

        /* Unsafe State */
        <div className="w-full p-4 border border-rose-500/20 bg-rose-500/5 rounded-xl flex items-center gap-4 text-rose-300">
          <div className="p-3 bg-rose-500/10 rounded-lg text-rose-400">
            <AlertOctagon size={24} />
          </div>

          <div>
            <h4 className="font-bold text-sm text-slate-200">
              No Safe Sequence Available!
            </h4>

            <p className="text-xs text-slate-400 mt-1">
              The system is in an unsafe state. The remaining resources are
              insufficient to guarantee that all processes can complete.
              Deadlock may occur if processes request their maximum needs.
            </p>
          </div>
        </div>

      ) : sequence && sequence.length > 0 ? (

        /* Safe Sequence Display */
        <div className="flex flex-col gap-3">

          {/* Safe Status Banner */}
          <div className="w-full p-3 border border-emerald-500/20 bg-emerald-500/5 rounded-xl flex items-center gap-3 text-emerald-300 text-xs mb-1">
            <ShieldCheck size={16} className="text-emerald-400" />

            <span>
              The system is <strong>SAFE</strong>. There exists at least one
              order of process executions that prevents deadlock.
            </span>
          </div>

          {/* Safe Sequence Nodes */}
          <motion.div
            className="flex items-center gap-2 overflow-x-auto py-2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            key={sequence.join(',')}
          >

            {sequence.map((pId, idx) => (
              <React.Fragment key={pId}>

                {/* Process Node */}
                <motion.div
                  variants={itemVariants}
                  className="flex flex-col items-center justify-center w-14 h-14 shrink-0 rounded-xl bg-slate-900 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.05)] hover:border-emerald-500/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all cursor-default"
                >
                  <span className="text-[10px] text-slate-500 font-bold uppercase">
                    Proc
                  </span>

                  <span className="text-sm font-extrabold text-emerald-400">
                    P{pId}
                  </span>
                </motion.div>

                {/* Arrow Connector */}
                {idx < sequence.length - 1 && (
                  <motion.div
                    variants={itemVariants}
                    className="text-slate-600 shrink-0"
                  >
                    <ChevronRight
                      size={16}
                      className="animate-pulse text-emerald-400/50"
                    />
                  </motion.div>
                )}

              </React.Fragment>
            ))}

          </motion.div>
        </div>

      ) : (

        /* Empty State */
        <div className="w-full py-6 text-center text-xs text-slate-500">
          No active safe sequence generated yet. Configure non-zero matrices to
          run the check.
        </div>

      )}
    </div>
  );
}

export default SafeSequence;