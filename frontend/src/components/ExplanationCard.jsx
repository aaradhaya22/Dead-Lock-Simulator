// frontend/src/components/ExplanationCard.jsx

import React from 'react';
import { Sparkles, Bot, AlertTriangle } from 'lucide-react';

function ExplanationCard({ explanation, isExplaining, latestRequest }) {
  
  // Custom parser to translate markdown markers (###, -, **) into style spans
  const renderFormattedExplanation = (text) => {
    if (!text) return null;
    
    return text.split('\n').map((line, idx) => {
      const trimmed = line.trim();
      
      if (trimmed === '') {
        return <div key={idx} className="h-2" />;
      }
      
      if (trimmed.startsWith('### ')) {
        return (
          <h4 key={idx} className="font-extrabold text-sm text-slate-200 mt-4 mb-2 first:mt-0 flex items-center gap-1.5 border-b border-white/5 pb-1">
            {trimmed.replace('### ', '')}
          </h4>
        );
      }
      
      if (trimmed.startsWith('- ')) {
        return (
          <li key={idx} className="text-xs text-slate-400 pl-4 py-0.5 list-none relative before:content-['•'] before:absolute before:left-0 before:text-cyberCyan">
            {parseBoldText(trimmed.replace('- ', ''))}
          </li>
        );
      }

      return (
        <p key={idx} className="text-xs text-slate-400 leading-relaxed mb-1.5">
          {parseBoldText(line)}
        </p>
      );
    });
  };

  // Helper to parse double asterisks (**) into bold spans
  const parseBoldText = (text) => {
    return text.split('**').map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="font-semibold text-cyberCyan">{part}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="glass-panel p-6 flex flex-col gap-4 relative overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyberPurple to-cyberCyan"></div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-cyberCyan animate-pulse" />
          <h2 className="font-bold text-base text-slate-200">AI Auto-Explanation</h2>
        </div>
        
        {latestRequest && (
          <span className="text-[9px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-slate-400 font-bold uppercase tracking-wider">
            Process P{latestRequest.process_id} Request
          </span>
        )}
      </div>

      {isExplaining ? (
        /* Dynamic Skeleton Loader */
        <div className="flex flex-col gap-3 py-2">
          <div className="flex items-center gap-2 mb-2">
            <Bot size={16} className="text-cyberCyan animate-spin-slow" />
            <span className="text-[10px] text-cyberCyan font-bold uppercase tracking-wider animate-pulse-fast">
              AI Guardian is generating explanation...
            </span>
          </div>
          
          <div className="h-4 bg-slate-900/60 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-slate-900/60 rounded animate-pulse w-full"></div>
          <div className="h-4 bg-slate-900/60 rounded animate-pulse w-5/6"></div>
          <div className="h-4 bg-slate-900/60 rounded animate-pulse w-2/3"></div>
          
          {/* Skeleton loading animation bar */}
          <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-gradient-to-r from-cyberCyan to-cyberPurple w-1/3 rounded-full animate-loading-slide"></div>
          </div>
        </div>
      ) : explanation ? (
        /* Rendered Response */
        <div className="bg-slate-950/30 border border-white/5 rounded-xl p-4 max-h-[300px] overflow-y-auto">
          {renderFormattedExplanation(explanation)}
        </div>
      ) : (
        /* Empty placeholder */
        <div className="text-center py-8 text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
          <Bot size={24} className="text-slate-600" />
          <span>No transaction explanation generated yet. Trigger a manual safety check or resource request to view detailed AI analysis.</span>
        </div>
      )}
    </div>
  );
}

export default ExplanationCard;
