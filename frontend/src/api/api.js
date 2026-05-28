// frontend/src/api/api.js

import axios from 'axios';

// Configure standard API base URL
const API_BASE_URL = 'http://127.0.0.1:5000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000 // 10 seconds timeout
});

/**
 * Standard error formatter for API calls
 */
const formatError = (error) => {
  if (error.response) {
    // Server responded with an error status (400, 500, etc.)
    return error.response.data?.error || `Server Error: ${error.response.statusText}`;
  } else if (error.request) {
    // Request was made but no response was received
    return 'Cannot connect to backend server. Make sure your Python Flask app is running on port 5000.';
  } else {
    // Something else went wrong
    return error.message;
  }
};

/**
 * Initialize backend system state
 */
export const initializeSystem = async (processes, resources, available = null, maxMatrix = null, allocMatrix = null) => {
  try {
    const payload = {
      processes: parseInt(processes),
      resources: parseInt(resources)
    };
    
    if (available && maxMatrix && allocMatrix) {
      payload.available = available.map(Number);
      payload.max_matrix = maxMatrix.map(row => row.map(Number));
      payload.alloc_matrix = allocMatrix.map(row => row.map(Number));
    }
    
    const response = await apiClient.post('/initialize', payload);
    return response.data;
  } catch (error) {
    throw new Error(formatError(error));
  }
};

/**
 * Run Safety Check on dynamic matrix configurations
 */
export const checkSafeState = async (available, maxMatrix, allocMatrix) => {
  try {
    const payload = {
      available: available.map(Number),
      max_matrix: maxMatrix.map(row => row.map(Number)),
      alloc_matrix: allocMatrix.map(row => row.map(Number))
    };
    
    const response = await apiClient.post('/check-safe', payload);
    return response.data;
  } catch (error) {
    throw new Error(formatError(error));
  }
};

/**
 * Submit resource request vector from a specific process
 */
export const requestResources = async (processId, requestVector) => {
  try {
    const payload = {
      process_id: parseInt(processId),
      request: requestVector.map(Number)
    };
    
    const response = await apiClient.post('/request-resource', payload);
    return response.data;
  } catch (error) {
    throw new Error(formatError(error));
  }
};

/**
 * Fetch AI Auto-Explanations or Chatbot Answers from Gemini API
 */
export const getAIExplanation = async ({ type, requestDetails = null, responseStatus = null, message = null, chatHistory = null }) => {
  try {
    const payload = { type };
    
    if (type === 'request') {
      payload.request_details = requestDetails;
      payload.response_status = responseStatus;
    } else if (type === 'chat') {
      payload.message = message;
      payload.chat_history = chatHistory;
    }
    
    const response = await apiClient.post('/ai-explain', payload);
    return response.data;
  } catch (error) {
    throw new Error(formatError(error));
  }
};
