// Local storage utilities for conversation persistence
const STORAGE_KEYS = {
  CONVERSATION_HISTORY: 'claude-chat-conversation-history',
  SESSION_ID: 'claude-chat-session-id'
};

// Generate unique session ID
const generateSessionId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// Storage wrapper with error handling
class StorageManager {
  constructor() {
    this.isAvailable = this.checkStorageAvailability();
  }

  checkStorageAvailability() {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      console.warn('localStorage is not available:', error);
      return false;
    }
  }

  setItem(key, value) {
    if (!this.isAvailable) return false;
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      return false;
    }
  }

  getItem(key, defaultValue = null) {
    if (!this.isAvailable) return defaultValue;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return defaultValue;
    }
  }

  removeItem(key) {
    if (!this.isAvailable) return false;
    
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
      return false;
    }
  }

  clear() {
    if (!this.isAvailable) return false;
    
    try {
      // Only clear our app's keys
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
      return false;
    }
  }
}

// Create singleton instance
const storage = new StorageManager();

// Conversation persistence functions
export const conversationStorage = {
  // Save conversation history
  saveConversation(messages) {
    const conversationData = {
      messages,
      lastUpdated: new Date().toISOString(),
      sessionId: this.getSessionId()
    };
    
    return storage.setItem(STORAGE_KEYS.CONVERSATION_HISTORY, conversationData);
  },

  // Load conversation history
  loadConversation() {
    const data = storage.getItem(STORAGE_KEYS.CONVERSATION_HISTORY);
    
    if (!data || !data.messages) {
      return { messages: [], sessionId: this.getSessionId() };
    }

    // Convert timestamp strings back to Date objects
    const messages = data.messages.map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }));

    return {
      messages,
      sessionId: data.sessionId || this.getSessionId(),
      lastUpdated: data.lastUpdated ? new Date(data.lastUpdated) : null
    };
  },

  // Get or create session ID
  getSessionId() {
    let sessionId = storage.getItem(STORAGE_KEYS.SESSION_ID);
    
    if (!sessionId) {
      sessionId = generateSessionId();
      storage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
    }
    
    return sessionId;
  },

  // Clear conversation data
  clearConversation() {
    const success = storage.clear();
    if (success) {
      // Generate new session ID
      const newSessionId = generateSessionId();
      storage.setItem(STORAGE_KEYS.SESSION_ID, newSessionId);
    }
    return success;
  },

  // Check if storage is available
  isStorageAvailable() {
    return storage.isAvailable;
  },

  // Get storage status for debugging
  getStorageInfo() {
    return {
      available: storage.isAvailable,
      hasConversation: !!storage.getItem(STORAGE_KEYS.CONVERSATION_HISTORY),
      sessionId: this.getSessionId()
    };
  }
};

export default conversationStorage;