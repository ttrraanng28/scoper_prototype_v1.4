import React, { useState, useEffect, useRef } from 'react';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import LoadingIndicator from './components/LoadingIndicator';
import { chatApi, getErrorMessage, retryWithBackoff } from './utils/api';
import conversationStorage from './utils/storage';

function App() {
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('checking'); // 'checking', 'connected', 'disconnected'
  const [sessionId, setSessionId] = useState(null);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = (force = false) => {
    if (messagesEndRef.current) {
      // Check if user is near the bottom before auto-scrolling
      const container = messagesEndRef.current.parentElement;
      if (container) {
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
        
        if (force || isNearBottom) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  useEffect(() => {
    // Always scroll on new messages, but respect user scroll position for loading states
    scrollToBottom(conversationHistory.length > 0);
  }, [conversationHistory]);

  useEffect(() => {
    // Don't force scroll for loading states - let user maintain their position
    if (isLoading) {
      scrollToBottom(false);
    }
  }, [isLoading]);

  // Load conversation from localStorage on app load
  useEffect(() => {
    const loadStoredConversation = () => {
      try {
        const { messages, sessionId: storedSessionId } = conversationStorage.loadConversation();
        setConversationHistory(messages);
        setSessionId(storedSessionId);
        setStorageAvailable(conversationStorage.isStorageAvailable());
        
        if (!conversationStorage.isStorageAvailable()) {
          console.warn('localStorage not available - conversation will not persist');
        }
      } catch (error) {
        console.error('Failed to load conversation from storage:', error);
        setStorageAvailable(false);
      }
    };

    loadStoredConversation();
  }, []);

  // Save conversation to localStorage whenever it changes
  useEffect(() => {
    if (conversationHistory.length > 0 && storageAvailable) {
      try {
        conversationStorage.saveConversation(conversationHistory);
      } catch (error) {
        console.error('Failed to save conversation to storage:', error);
        setStorageAvailable(false);
      }
    }
  }, [conversationHistory, storageAvailable]);

  // Check backend connection on app load with retry
  useEffect(() => {
    const checkConnection = async (retryAttempt = 0) => {
      try {
        await chatApi.healthCheck();
        setConnectionStatus('connected');
      } catch (err) {
        console.error('Backend connection failed:', err);
        
        if (retryAttempt < 2) {
          // Retry connection check up to 2 times
          setTimeout(() => checkConnection(retryAttempt + 1), 2000 * (retryAttempt + 1));
        } else {
          setConnectionStatus('disconnected');
        }
      }
    };

    checkConnection();
  }, []);

  // Generate unique ID for messages
  const generateMessageId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const handleSendMessage = async (messageContent, isRetry = false) => {
    if (!messageContent.trim()) return;

    // Clear any previous errors
    setError(null);
    
    // Don't add user message again if this is a retry
    if (!isRetry) {
      setRetryCount(0);
      
      // Add user message to conversation
      const userMessage = {
        id: generateMessageId(),
        role: 'user',
        content: messageContent,
        timestamp: new Date()
      };

      setConversationHistory(prev => [...prev, userMessage]);
    }
    
    setIsLoading(true);

    try {
      // Send message to backend with conversation context using retry mechanism
      const response = await retryWithBackoff(
        () => chatApi.sendMessage(messageContent, conversationHistory),
        3, // max retries
        1000 // base delay
      );
      
      // Add AI response to conversation
      const aiMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      setConversationHistory(prev => [...prev, aiMessage]);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      console.error('Failed to send message:', err);
      const errorInfo = getErrorMessage(err);
      setError(errorInfo);
      
      // Remove the user message if the API call failed and this wasn't a retry
      if (!isRetry) {
        setConversationHistory(prev => prev.slice(0, -1));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearConversation = () => {
    try {
      conversationStorage.clearConversation();
      setConversationHistory([]);
      const newSessionId = conversationStorage.getSessionId();
      setSessionId(newSessionId);
      setError(null);
      setRetryCount(0);
    } catch (error) {
      console.error('Failed to clear conversation:', error);
      setError({
        message: 'Failed to clear conversation history',
        type: 'storage',
        retryable: false
      });
    }
  };

  const handleRetryLastMessage = () => {
    if (conversationHistory.length === 0) return;
    
    // Find the last user message
    const lastUserMessage = [...conversationHistory].reverse().find(msg => msg.role === 'user');
    
    if (lastUserMessage) {
      setRetryCount(prev => prev + 1);
      handleSendMessage(lastUserMessage.content, true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-3 sm:px-4 py-3">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
              Claude Chat UI
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">
              Business consultation with AI
              {!storageAvailable && (
                <span className="text-orange-600 ml-2">• Session not saved</span>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {conversationHistory.length > 0 && (
              <button
                onClick={handleClearConversation}
                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded border border-gray-300 hover:border-gray-400 transition-colors"
                title="Clear conversation history"
              >
                Clear Chat
              </button>
            )}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' :
                connectionStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'
              }`}></div>
              <span className="text-xs text-gray-500 hidden sm:inline">
                {connectionStatus === 'connected' ? 'Connected' :
                 connectionStatus === 'disconnected' ? 'Disconnected' : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full bg-white shadow-lg m-2 sm:m-4 rounded-lg overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {conversationHistory.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-gray-50">
              <div className="text-center text-gray-500 max-w-md">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-lg sm:text-xl font-medium mb-3 text-gray-900">Welcome to Claude Chat</h2>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  Get structured business consultation powered by AI. Ask about challenges, strategies, or get project recommendations.
                </p>
                <div className="text-xs sm:text-sm text-gray-500 space-y-1">
                  <p>• Share your business challenges</p>
                  <p>• Get structured analysis and recommendations</p>
                  <p>• Receive actionable project suggestions</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
            <MessageList messages={conversationHistory} isLoading={isLoading} />
            
            {/* Scroll to bottom button */}
            <button
              onClick={() => scrollToBottom(true)}
              className="absolute bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-colors opacity-80 hover:opacity-100"
              title="Scroll to bottom"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error Display */}
        {error && (
          <div className={`border-l-4 p-3 sm:p-4 mx-3 sm:mx-4 mb-3 sm:mb-4 rounded-r ${
            error.type === 'network' ? 'bg-orange-50 border-orange-400' :
            error.type === 'rate_limit' ? 'bg-yellow-50 border-yellow-400' :
            'bg-red-50 border-red-400'
          }`}>
            <div className="flex justify-between items-start">
              <div className="flex">
                <div className="flex-shrink-0">
                  {error.type === 'network' ? (
                    <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  ) : error.type === 'rate_limit' ? (
                    <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <p className={`text-sm ${
                    error.type === 'network' ? 'text-orange-700' :
                    error.type === 'rate_limit' ? 'text-yellow-700' :
                    'text-red-700'
                  }`}>
                    {error.message || error}
                  </p>
                  {retryCount > 0 && (
                    <p className="text-xs text-gray-600 mt-1">
                      Retry attempt: {retryCount}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                {error.retryable && (
                  <button
                    onClick={handleRetryLastMessage}
                    disabled={isLoading}
                    className={`text-xs font-medium px-2 py-1 rounded border transition-colors ${
                      error.type === 'network' ? 'text-orange-700 border-orange-300 hover:bg-orange-100' :
                      error.type === 'rate_limit' ? 'text-yellow-700 border-yellow-300 hover:bg-yellow-100' :
                      'text-red-700 border-red-300 hover:bg-red-100'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isLoading ? 'Retrying...' : 'Retry'}
                  </button>
                )}
                <button
                  onClick={() => setError(null)}
                  className={`font-medium text-sm ${
                    error.type === 'network' ? 'text-orange-400 hover:text-orange-600' :
                    error.type === 'rate_limit' ? 'text-yellow-400 hover:text-yellow-600' :
                    'text-red-400 hover:text-red-600'
                  }`}
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <MessageInput 
          onSendMessage={handleSendMessage} 
          disabled={isLoading || connectionStatus === 'disconnected'} 
        />
      </div>
    </div>
  );
}

export default App;