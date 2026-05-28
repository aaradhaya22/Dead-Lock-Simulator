// frontend/src/pages/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, AlertTriangle, Play, CheckCircle2, XCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import MatrixInput from '../components/MatrixInput';
import NeedMatrix from '../components/NeedMatrix';
import SafeSequence from '../components/SafeSequence';
import RequestPanel from '../components/RequestPanel';
import ExplanationCard from '../components/ExplanationCard';
import StatusCard from '../components/StatusCard';
import AIChatbot from '../components/AIChatbot';
import { initializeSystem, checkSafeState, requestResources, getAIExplanation } from '../api/api';
import { getStandardTextbookData } from '../utils/matrixHelpers';

function Dashboard({ onBack }) {
  // Primary simulation states
  const [numProcesses, setNumProcesses] = useState(5);
  const [numResources, setNumResources] = useState(3);
  const [available, setAvailable] = useState([]);
  const [maxMatrix, setMaxMatrix] = useState([]);
  const [allocMatrix, setAllocMatrix] = useState([]);
  const [needMatrix, setNeedMatrix] = useState([]);
  
  // Safety evaluation results
  const [isSafe, setIsSafe] = useState(true);
  const [safeSequence, setSafeSequence] = useState([]);
  
  // Transaction logs & explanations
  const [logs, setLogs] = useState([]);
  const [latestExplanation, setLatestExplanation] = useState('');
  const [latestRequest, setLatestRequest] = useState(null);

  // UI state management
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Async Loading states
  const [loading, setLoading] = useState({
    initializing: false,
    checking: false,
    requesting: false,
    explaining: false
  });

  // State Persistence: Load from localStorage on mount
  useEffect(() => {
    const savedStateStr = localStorage.getItem('deadlock_sim_state');
    if (savedStateStr) {
      try {
        const saved = JSON.parse(savedStateStr);
        setNumProcesses(saved.numProcesses);
        setNumResources(saved.numResources);
        setAvailable(saved.available);
        setMaxMatrix(saved.maxMatrix);
        setAllocMatrix(saved.allocMatrix);
        setNeedMatrix(saved.needMatrix);
        setIsSafe(saved.isSafe);
        setSafeSequence(saved.safeSequence);
        setLogs(saved.logs || []);
        setLatestExplanation(saved.latestExplanation || '');
        setLatestRequest(saved.latestRequest || null);
        
        // Synchronize backend with saved state
        syncStateWithBackend(saved);
        return;
      } catch (e) {
        console.error('Failed to parse cached state, falling back to default:', e);
      }
    }
    
    // No cache found, initialize default standard textbook simulation
    loadDefaultSimulation();
  }, []);

  // helper to synchronize saved state with backend on reload
  const syncStateWithBackend = async (saved) => {
    setLoading(prev => ({ ...prev, initializing: true }));
    try {
      await initializeSystem(
        saved.numProcesses,
        saved.numResources,
        saved.available,
        saved.maxMatrix,
        saved.allocMatrix
      );
    } catch (err) {
      setErrorMsg(`Failed to synchronize state with backend: ${err.message}`);
    } finally {
      setLoading(prev => ({ ...prev, initializing: false }));
    }
  };

  // Cache current simulator state to localStorage
  const saveStateToCache = (updatedFields = {}) => {
    const fullState = {
      numProcesses,
      numResources,
      available,
      maxMatrix,
      allocMatrix,
      needMatrix,
      isSafe,
      safeSequence,
      logs,
      latestExplanation,
      latestRequest,
      ...updatedFields
    };
    localStorage.setItem('deadlock_sim_state', JSON.stringify(fullState));
  };

  // Clear local cache & reset
  const handleReset = () => {
    localStorage.removeItem('deadlock_sim_state');
    setLogs([]);
    setLatestExplanation('');
    setLatestRequest(null);
    loadDefaultSimulation();
  };

  // Setup textbook standard template
  const loadDefaultSimulation = async () => {
    setLoading(prev => ({ ...prev, initializing: true }));
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      const defaults = getStandardTextbookData();
      
      const res = await initializeSystem(
        defaults.numProcesses,
        defaults.numResources,
        defaults.available,
        defaults.maxMatrix,
        defaults.allocMatrix
      );
      
      // Update states
      setNumProcesses(res.state.num_processes);
      setNumResources(res.state.num_resources);
      setAvailable(res.state.available);
      setMaxMatrix(res.state.max_matrix);
      setAllocMatrix(res.state.alloc_matrix);
      setNeedMatrix(res.state.need_matrix);
      setIsSafe(res.state.is_safe);
      setSafeSequence(res.state.safe_sequence);
      
      const initLog = {
        time: new Date().toLocaleTimeString(),
        type: 'info',
        text: 'Simulation initialized with textbook standard matrices (5 Processes, 3 Resources).'
      };
      
      setLogs([initLog]);
      setLatestExplanation('Simulation initialized! Edit matrices or execute a process resource request.');
      
      // Cache
      saveStateToCache({
        numProcesses: res.state.num_processes,
        numResources: res.state.num_resources,
        available: res.state.available,
        maxMatrix: res.state.max_matrix,
        allocMatrix: res.state.alloc_matrix,
        needMatrix: res.state.need_matrix,
        isSafe: res.state.is_safe,
        safeSequence: res.state.safe_sequence,
        logs: [initLog],
        latestRequest: null,
        latestExplanation: 'Simulation initialized! Edit matrices or execute a process resource request.'
      });
      
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(prev => ({ ...prev, initializing: false }));
    }
  };

  // Handles state reconfiguration (changing processes/resources count)
  const handleConfigureDimension = async (processes, resources) => {
    setLoading(prev => ({ ...prev, initializing: true }));
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      // Reinitialize backend with empty template matrices
      const res = await initializeSystem(processes, resources);
      
      setNumProcesses(res.state.num_processes);
      setNumResources(res.state.num_resources);
      setAvailable(res.state.available);
      setMaxMatrix(res.state.max_matrix);
      setAllocMatrix(res.state.alloc_matrix);
      setNeedMatrix(res.state.need_matrix);
      setIsSafe(res.state.is_safe);
      setSafeSequence(res.state.safe_sequence);
      
      const reconfigLog = {
        time: new Date().toLocaleTimeString(),
        type: 'info',
        text: `Reconfigured layout dimensions to ${processes} processes and ${resources} resource types.`
      };
      
      setLogs(prev => [reconfigLog, ...prev]);
      setLatestExplanation(`Simulation reconfigured. Enter max demand, current allocation and available resources, then verify safety.`);
      
      saveStateToCache({
        numProcesses: res.state.num_processes,
        numResources: res.state.num_resources,
        available: res.state.available,
        maxMatrix: res.state.max_matrix,
        allocMatrix: res.state.alloc_matrix,
        needMatrix: res.state.need_matrix,
        isSafe: res.state.is_safe,
        safeSequence: res.state.safe_sequence,
        logs: [reconfigLog, ...logs],
        latestRequest: null,
        latestExplanation: `Simulation reconfigured. Enter max demand, current allocation and available resources, then verify safety.`
      });
      
      setSuccessMsg('Layout updated successfully! Enter your matrix values.');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(prev => ({ ...prev, initializing: false }));
    }
  };

  // Save changes made inside the editable matrix table
  const handleSaveMatrices = async (updatedAvailable, updatedMax, updatedAlloc) => {
    setLoading(prev => ({ ...prev, checking: true }));
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      // API call updates backend state matrices and runs a safety verification check
      const res = await checkSafeState(updatedAvailable, updatedMax, updatedAlloc);
      
      setAvailable(res.state.available);
      setMaxMatrix(res.state.max_matrix);
      setAllocMatrix(res.state.alloc_matrix);
      setNeedMatrix(res.state.need_matrix);
      setIsSafe(res.is_safe);
      setSafeSequence(res.safe_sequence);
      
      const saveLog = {
        time: new Date().toLocaleTimeString(),
        type: res.is_safe ? 'success' : 'warning',
        text: `Matrices updated manually. Safety check outcome: System is in a ${res.is_safe ? 'SAFE' : 'UNSAFE'} state.`
      };
      
      setLogs(prev => [saveLog, ...prev]);
      setSuccessMsg('Matrices committed and safety evaluation complete.');
      
      // Auto-trigger Gemini API to explain why the edited matrices state is safe/unsafe
      generateAIExplanationOfState(res.state, null, {
        granted: res.is_safe,
        reason: res.message,
        safe_sequence: res.safe_sequence
      });
      
      saveStateToCache({
        available: res.state.available,
        maxMatrix: res.state.max_matrix,
        allocMatrix: res.state.alloc_matrix,
        needMatrix: res.state.need_matrix,
        isSafe: res.is_safe,
        safeSequence: res.safe_sequence,
        logs: [saveLog, ...logs]
      });
      
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(prev => ({ ...prev, checking: false }));
    }
  };

  // Execute Banker's safety check on demand
  const handleManualSafetyCheck = async () => {
    setLoading(prev => ({ ...prev, checking: true }));
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      const res = await checkSafeState(available, maxMatrix, allocMatrix);
      
      setIsSafe(res.is_safe);
      setSafeSequence(res.safe_sequence);
      
      const checkLog = {
        time: new Date().toLocaleTimeString(),
        type: res.is_safe ? 'success' : 'warning',
        text: `Manual safety check: System safety is verified as ${res.is_safe ? 'SAFE' : 'UNSAFE'}.`
      };
      
      setLogs(prev => [checkLog, ...prev]);
      
      generateAIExplanationOfState(res.state, null, {
        granted: res.is_safe,
        reason: res.message,
        safe_sequence: res.safe_sequence
      });
      
      saveStateToCache({
        isSafe: res.is_safe,
        safeSequence: res.safe_sequence,
        logs: [checkLog, ...logs]
      });
      
      if (res.is_safe) {
        setSuccessMsg(`Safety sweep complete. Safe sequence found: ${res.safe_sequence.map(p => `P${p}`).join(' -> ')}`);
      } else {
        setErrorMsg('Unsafe state! Granting future allocations may lead to a deadlock.');
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(prev => ({ ...prev, checking: false }));
    }
  };

  // Trigger process request vector submission
  const handleRequestResources = async (processId, requestVector) => {
    setLoading(prev => ({ ...prev, requesting: true }));
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      const res = await requestResources(processId, requestVector);
      
      // Update frontend state matrices based on backend outcome
      setAvailable(res.state.available);
      setMaxMatrix(res.state.max_matrix);
      setAllocMatrix(res.state.alloc_matrix);
      setNeedMatrix(res.state.need_matrix);
      setIsSafe(res.state.is_safe);
      setSafeSequence(res.state.safe_sequence);
      
      const requestLog = {
        time: new Date().toLocaleTimeString(),
        type: res.granted ? 'success' : 'danger',
        text: `Request from P${processId} requesting ${JSON.stringify(requestVector)}: ${res.granted ? 'GRANTED' : 'DENIED'} - ${res.reason}`
      };
      
      setLogs(prev => [requestLog, ...prev]);
      setLatestRequest({ process_id: processId, request: requestVector });
      
      // Cache
      saveStateToCache({
        available: res.state.available,
        maxMatrix: res.state.max_matrix,
        allocMatrix: res.state.alloc_matrix,
        needMatrix: res.state.need_matrix,
        isSafe: res.state.is_safe,
        safeSequence: res.state.safe_sequence,
        logs: [requestLog, ...logs],
        latestRequest: { process_id: processId, request: requestVector }
      });
      
      if (res.granted) {
        setSuccessMsg(`Request successfully granted! Resources allocated to P${processId}.`);
      } else {
        setErrorMsg(`Request Denied! ${res.reason}`);
      }

      // Auto-trigger Gemini explanation
      generateAIExplanationOfState(res.state, { process_id: processId, request: requestVector }, {
        granted: res.granted,
        reason: res.reason,
        safe_sequence: res.safe_sequence
      });
      
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(prev => ({ ...prev, requesting: false }));
    }
  };

  // Call API to fetch AI generator explanations
  const generateAIExplanationOfState = async (stateObj, reqDetails, respStatus) => {
    setLoading(prev => ({ ...prev, explaining: true }));
    try {
      const res = await getAIExplanation({
        type: 'request',
        requestDetails: reqDetails,
        responseStatus: respStatus
      });
      
      setLatestExplanation(res.explanation);
      saveStateToCache({
        latestExplanation: res.explanation
      });
    } catch (err) {
      console.error('AI Explanation failed:', err);
      // Fallback is resolved backend-side, so this generally only triggers if backend is completely down
      setLatestExplanation('Failed to fetch AI explanation. Verify your server is connected.');
    } finally {
      setLoading(prev => ({ ...prev, explaining: false }));
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen relative pb-16">
      {/* Top Navigation */}
      <Navbar 
        onBack={onBack} 
        onReset={handleReset} 
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        isInitializing={loading.initializing}
      />
      
      {/* Main Alert notifications */}
      <div className="max-w-7xl w-full mx-auto px-4 mt-6">
        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-4 border border-rose-500/20 bg-rose-500/10 text-rose-300 rounded-xl flex items-start gap-3"
            >
              <AlertTriangle className="shrink-0 text-rose-400 mt-0.5" size={18} />
              <div className="flex-1">
                <span className="font-semibold">Operation Error:</span> {errorMsg}
              </div>
              <button onClick={() => setErrorMsg('')} className="text-rose-400 hover:text-rose-200 font-bold px-1">&times;</button>
            </motion.div>
          )}

          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-4 border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 rounded-xl flex items-start gap-3"
            >
              <CheckCircle2 className="shrink-0 text-emerald-400 mt-0.5" size={18} />
              <div className="flex-1">
                <span className="font-semibold">Success:</span> {successMsg}
              </div>
              <button onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:text-emerald-200 font-bold px-1">&times;</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Grid Dashboard layout */}
      <div className="max-w-7xl w-full mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2 flex-1 items-start">
        
        {/* LEFT COLUMN: Configurations & Matrix Inputs (8 cols wide on desktop) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* A. System Configuration Panel & Vector Matrices Inputs */}
          <MatrixInput 
            numProcesses={numProcesses}
            numResources={numResources}
            available={available}
            maxMatrix={maxMatrix}
            allocMatrix={allocMatrix}
            onConfigure={handleConfigureDimension}
            onSave={handleSaveMatrices}
            isProcessing={loading.initializing || loading.checking}
          />

          {/* B. Need Matrix Panel */}
          <NeedMatrix 
            needMatrix={needMatrix} 
            numProcesses={numProcesses} 
            numResources={numResources}
            isProcessing={loading.initializing}
          />
          
          {/* C. Safe Sequence Animation Board */}
          <SafeSequence 
            sequence={safeSequence} 
            isSafe={isSafe} 
            isProcessing={loading.checking}
          />
        </div>
        
        {/* RIGHT COLUMN: Request Panel, Telemetry, and AI Explanations (4 cols wide) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* D. Safety Telemetry & Logs */}
          <StatusCard 
            isSafe={isSafe} 
            safeSequence={safeSequence} 
            logs={logs}
            onRunCheck={handleManualSafetyCheck}
            isChecking={loading.checking}
          />

          {/* E. Request Panel */}
          <RequestPanel 
            numProcesses={numProcesses}
            numResources={numResources}
            available={available}
            needMatrix={needMatrix}
            onRequestSubmit={handleRequestResources}
            isRequesting={loading.requesting}
          />
          
          {/* F. AI Explanation Card */}
          <ExplanationCard 
            explanation={latestExplanation}
            isExplaining={loading.explaining}
            latestRequest={latestRequest}
          />
        </div>
      </div>
      
      {/* Sliding AI Chatbot sidebar */}
      <AIChatbot 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        numProcesses={numProcesses}
        numResources={numResources}
        available={available}
        maxMatrix={maxMatrix}
        allocMatrix={allocMatrix}
        needMatrix={needMatrix}
        isSafe={isSafe}
        safeSequence={safeSequence}
      />
    </div>
  );
}

export default Dashboard;
