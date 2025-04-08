import axios from 'axios';
import io from 'socket.io-client';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1/';
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'wss://api.example.com';

// API key - should be securely stored and retrieved
const API_KEY = import.meta.env.VITE_API_KEY;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY
  }
  // Removed timeout to allow unlimited time for requests
});

// WebSocket connection
let socket = null;

// WebSocket Event Handlers
const socketEventHandlers = new Map();

// Initialize WebSocket connection
export const initializeWebSocket = (options = {}) => {
  if (socket && socket.connected) {
    console.log('Disconnecting existing socket connection');
    socket.disconnect();
  }

  const {
    onConnect,
    onDisconnect,
    onError,
    onSubscribed,
    onUnsubscribed,
    onTaskUpdate,
    onPong,
    customOptions = {}
  } = options;

  socket = io(WS_BASE_URL, {
    extraHeaders: {
      'X-API-Key': API_KEY
    },
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000,
    ...customOptions
  });

  // Connection events
  socket.on('connect', () => {
    console.log('Connected to WebSocket server');
    if (onConnect) onConnect(socket.id);
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from WebSocket server');
    if (onDisconnect) onDisconnect();
  });

  socket.on('connect_error', (error) => {
    console.error('WebSocket connection error:', error);
    if (onError) onError(error);
  });

  // Server events
  socket.on('subscribed', (data) => {
    if (onSubscribed) onSubscribed(data);
  });

  socket.on('unsubscribed', (data) => {
    if (onUnsubscribed) onUnsubscribed(data);
  });

  socket.on('task_update', (data) => {
    if (onTaskUpdate) onTaskUpdate(data);
  });

  socket.on('pong', (data) => {
    if (onPong) onPong(data);
  });

  return socket;
};

// Test WebSocket connection
export const testWebSocketConnection = async (url) => {
  try {
    const response = await fetch(`${url}/ws/test`);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(`WebSocket test failed: ${error.message}`);
  }
};

// Emit custom event
export const emitSocketEvent = (eventName, data = {}) => {
  if (!socket || !socket.connected) {
    throw new Error('WebSocket not connected');
  }
  socket.emit(eventName, data);
};

// Subscribe to task updates
export const subscribeToTask = (taskId) => {
  if (!socket || !socket.connected) {
    throw new Error('WebSocket not connected');
  }
  socket.emit('subscribe', { task_id: taskId });
};

// Unsubscribe from task updates
export const unsubscribeFromTask = (taskId) => {
  if (!socket || !socket.connected) {
    throw new Error('WebSocket not connected');
  }
  socket.emit('unsubscribe', { task_id: taskId });
};

// Get socket connection status
export const getSocketStatus = () => {
  return {
    initialized: !!socket,
    connected: socket?.connected || false,
    id: socket?.id
  };
};

// Disconnect WebSocket
export const disconnectWebSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Error handler
const handleApiError = (error) => {
  if (error.response) {
    const { status, data } = error.response;
    switch (status) {
      case 400:
        throw new Error(data.error || 'Invalid request');
      case 401:
        throw new Error('Unauthorized - Invalid API key');
      case 403:
        throw new Error('Forbidden - Insufficient permissions');
      case 429:
        throw new Error('Rate limit exceeded');
      default:
        throw new Error(data.error || 'An error occurred');
    }
  }
  throw error;
};

// ----- Workflow API -----

export const createWorkflow = async (workflowData) => {
  try {
    const response = await api.post('/workflows', workflowData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getWorkflow = async (workflowId) => {
  try {
    const response = await api.get(`/workflows/${workflowId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const executeWorkflow = async (workflowId, parameters = {}) => {
  try {
    const response = await api.post(`/workflows/${workflowId}/execute`, { parameters });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getWorkflows = async (page = 1, limit = 20) => {
  try {
    const response = await api.get('/workflows', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const triggerWorkflow = async (workflowId, parameters = {}) => {
  try {
    const response = await api.post(`/workflows/${workflowId}/execute`, {
      parameters
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getWorkflowStatus = async (workflowId) => {
  try {
    const response = await api.get(`/workflows/${workflowId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getWorkflowTasks = async (workflowId) => {
  try {
    const response = await api.get(`/workflows/${workflowId}/tasks`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getWorkflowLogs = async (workflowId, page = 1, limit = 100) => {
  try {
    const response = await api.get(`/workflows/${workflowId}/logs`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// ----- Model API -----

export const listModels = async () => {
  try {
    const response = await api.get('/models');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const generateText = async (prompt, options = {}) => {
  try {
    const response = await api.post('/models/generate', {
      prompt,
      ...options
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const generateChatResponse = async (messages, options = {}) => {
  try {
    const response = await api.post('/models/chat', {
      messages,
      ...options
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Rename listModels to getModels for consistency
export const getModels = listModels;

// ----- Agent API -----

export const listAgents = async () => {
  try {
    const response = await api.get('/agents');
    return response.data.agents;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const switchAgentModel = async (agentId, modelId) => {
  try {
    const response = await api.patch(`/agents/${agentId}/model`, {
      model_id: modelId
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Rename listAgents to getAgents for consistency
export const getAgents = listAgents;

// ----- Task API -----

export const createTask = async (taskData) => {
  try {
    const response = await api.post('/tasks', taskData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getTaskStatus = async (taskId) => {
  try {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// ----- Tool API -----

export const listTools = async () => {
  try {
    const response = await api.get('/tools');
    return response.data.tools;
  } catch (error) {
    throw handleApiError(error);
  }
};

// ----- System API -----

export const getHealthStatus = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// ----- Activity API -----
export const getActivities = async (page = 1, limit = 20) => {
  try {
    const response = await api.get('/activities', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// ----- WebSocket Subscriptions -----

export const subscribeToWorkflow = (workflowId, callbacks = {}) => {
  if (!socket) {
    initializeWebSocket();
  }

  const channel = `workflow:${workflowId}`;
  
  socket.emit('subscribe', { channel });

  socket.on('subscribed', (data) => {
    if (callbacks.onSubscribed) {
      callbacks.onSubscribed(data);
    }
  });

  socket.on('update', (data) => {
    if (callbacks.onUpdate) {
      callbacks.onUpdate(data);
    }
  });

  socket.on('task_update', (data) => {
    if (callbacks.onTaskUpdate) {
      callbacks.onTaskUpdate(data);
    }
  });

  socket.on('iteration_decision_request', (data) => {
    if (callbacks.onIterationDecision) {
      callbacks.onIterationDecision(data);
    }
  });

  return () => {
    socket.off('subscribed');
    socket.off('update');
    socket.off('task_update');
    socket.off('iteration_decision_request');
  };
};

// ----- Dashboard Data -----

export const getDashboardStats = async () => {
  try {
    // Fetch all required data in parallel
    const [
      { agents } = { agents: [] },
      { active_models: models = [] } = {},
      { workflows = [] },
      healthStatus
    ] = await Promise.all([
      listAgents(),
      listModels(),
      getWorkflows(),
      getHealthStatus()
    ]);

    // Process and return the dashboard data
    return {
      stats: {
        agents: agents.length,
        models: models.length,
        workflows: workflows.length,
        activities: workflows.filter(w => w.status === 'IN_PROGRESS').length
      },
      recentWorkflows: workflows.slice(0, 5), // Get 5 most recent workflows
      systemHealth: healthStatus
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      stats: {
        agents: 0,
        models: 0,
        workflows: 0,
        activities: 0
      },
      recentWorkflows: [],
      systemHealth: null
    };
  }
};

// ----- Goal to Task API -----

export const convertGoalToTasks = async (goalData) => {
  try {
    const response = await api.post('/workflows/goaltotask', {
      goal: goalData.goal,
      context: goalData.context
      // No timeout parameter - allowing unlimited time
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const executeTaskWorkflow = async (workflowId, options = {}) => {
  try {
    const response = await api.post(`/workflows/${workflowId}/execute`, {
      ...options
      // No timeout parameter - allowing unlimited time
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};
