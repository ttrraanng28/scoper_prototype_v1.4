import gsap from "gsap";
// Application State
const state = {
  conversationHistory: [],
  isLoading: false,
  error: null,
  retryCount: 0,
  connectionStatus: 'checking', // 'checking', 'connected', 'disconnected'
  sessionId: null,
  storageAvailable: true,
  hasInputInteracted: false,
  hasInputBeenFocused: false
};

// DOM Elements
const elements = {
  messagesWrapper: document.getElementById('messages-wrapper'),
  emptyState: document.getElementById('empty-state'),
  messagesList: document.getElementById('messages-list'),
  messagesEnd: document.getElementById('messages-end'),
  messageInput: document.getElementById('message-input'),
  sendBtn: document.getElementById('send-btn'),
  messageForm: document.getElementById('message-form'),
  clearChatBtn: document.getElementById('clear-chat-btn'),
  connectionIndicator: document.getElementById('connection-indicator'),
  connectionText: document.getElementById('connection-text'),
  storageWarning: document.getElementById('storage-warning'),
  errorContainer: document.getElementById('error-container'),
  scrollToBottomBtn: document.getElementById('scroll-to-bottom-btn'),
  cardWrapper: document.getElementById('card-wrapper')
};

// Generate unique ID for messages
const generateMessageId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// Render markdown to HTML
const renderMarkdown = (text) => {
  if (typeof marked !== 'undefined') {
    return marked.parse(text);
  }
  // Fallback: simple text rendering if marked is not available
  return text.replace(/\n/g, '<br>');
};

// Scroll to bottom helper
const scrollToBottom = (force = false) => {
  const container = elements.messagesList.parentElement;
  if (container) {
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    
    if (force || isNearBottom) {
      elements.messagesEnd.scrollIntoView({ behavior: 'smooth' });
    }
  }
};

const showMessagesInterface = () => {
  if (elements.messagesWrapper) {
    elements.messagesWrapper.style.display = 'flex';
  }
  if (elements.cardWrapper) {
    elements.cardWrapper.style.display = 'none';
  }
};

const showIntroCards = () => {
  if (elements.messagesWrapper) {
    elements.messagesWrapper.style.display = 'none';
  }
  if (elements.cardWrapper) {
    elements.cardWrapper.style.display = '';
  }
};

// Update connection status UI
const updateConnectionStatus = (status) => {
  state.connectionStatus = status;
  elements.connectionIndicator.className = 'connection-indicator';
  
  if (status === 'connected') {
    elements.connectionIndicator.classList.add('connection-connected');
    elements.connectionText.textContent = 'Connected';
  } else if (status === 'disconnected') {
    elements.connectionIndicator.classList.add('connection-disconnected');
    elements.connectionText.textContent = 'Disconnected';
  } else {
    elements.connectionIndicator.classList.add('connection-checking');
    elements.connectionText.textContent = 'Connecting...';
  }
};

// Render a single message
const renderMessage = (message) => {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${message.role}`;
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  
  if (message.role === 'user') {
    const textDiv = document.createElement('p');
    textDiv.className = 'message-text';
    textDiv.textContent = message.content;
    contentDiv.appendChild(textDiv);
  } else {
    const textDiv = document.createElement('div');
    textDiv.className = 'message-text';
    textDiv.innerHTML = renderMarkdown(message.content);
    contentDiv.appendChild(textDiv);
  }
  
  const timestampDiv = document.createElement('div');
  timestampDiv.className = 'message-timestamp';
  timestampDiv.textContent = new Date(message.timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  contentDiv.appendChild(timestampDiv);
  
  messageDiv.appendChild(contentDiv);
  return messageDiv;
};

// Render loading indicator
const renderLoadingIndicator = () => {
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'loading-message';
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'loading-content';
  
  const dotsDiv = document.createElement('div');
  dotsDiv.className = 'loading-dots';
  
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('div');
    dot.className = 'loading-dot';
    dotsDiv.appendChild(dot);
  }
  
  const textSpan = document.createElement('span');
  textSpan.className = 'loading-text';
  textSpan.textContent = 'AI is thinking...';
  
  contentDiv.appendChild(dotsDiv);
  contentDiv.appendChild(textSpan);
  loadingDiv.appendChild(contentDiv);
  
  return loadingDiv;
};

// Render error message
const renderError = (error) => {
  if (!error) {
    elements.errorContainer.style.display = 'none';
    return;
  }
  
  elements.errorContainer.style.display = 'block';
  elements.errorContainer.className = `error-container ${error.type || 'default'}`;
  
  const errorContent = `
    <div class="error-content">
      <div class="error-main">
        <div class="error-icon error-${error.type || 'default'}">
          ${error.type === 'network' ? `
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ` : error.type === 'rate_limit' ? `
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ` : `
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          `}
        </div>
        <div class="error-text-container">
          <p class="error-message">${error.message || error}</p>
          ${state.retryCount > 0 ? `<p class="error-retry-info">Retry attempt: ${state.retryCount}</p>` : ''}
        </div>
      </div>
      <div class="error-actions">
        ${error.retryable ? `
          <button class="error-retry-btn ${error.type || 'default'}" ${state.isLoading ? 'disabled' : ''}>
            ${state.isLoading ? 'Retrying...' : 'Retry'}
          </button>
        ` : ''}
        <button class="error-close-btn ${error.type || 'default'}">×</button>
      </div>
    </div>
  `;
  
  elements.errorContainer.innerHTML = errorContent;
  
  // Add event listeners
  const retryBtn = elements.errorContainer.querySelector('.error-retry-btn');
  if (retryBtn) {
    retryBtn.addEventListener('click', handleRetryLastMessage);
  }
  
  const closeBtn = elements.errorContainer.querySelector('.error-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      state.error = null;
      renderError(null);
    });
  }
};

// Update scroll button visibility
const updateScrollButton = () => {
  const container = elements.messagesList;
  if (container && container.style.display !== 'none') {
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    elements.scrollToBottomBtn.style.display = isNearBottom ? 'none' : 'block';
  } else {
    elements.scrollToBottomBtn.style.display = 'none';
  }
};

// Render messages
const renderMessages = () => {
  const hasMessages = state.conversationHistory.length > 0;

  if (hasMessages) {
    if (!state.hasInputInteracted) {
      state.hasInputInteracted = true;
    }
    showMessagesInterface();
  } else if (state.hasInputInteracted) {
    showMessagesInterface();
  } else {
    showIntroCards();
  }

  if (!hasMessages) {
    elements.emptyState.style.display = 'flex';
    elements.messagesList.style.display = 'none';
    elements.clearChatBtn.style.display = 'none';
    elements.scrollToBottomBtn.style.display = 'none';
  } else {
    elements.emptyState.style.display = 'none';
    elements.messagesList.style.display = 'flex';
    elements.clearChatBtn.style.display = 'block';
    
    elements.messagesList.innerHTML = '';
    
    state.conversationHistory.forEach(message => {
      elements.messagesList.appendChild(renderMessage(message));
    });
    
    if (state.isLoading) {
      elements.messagesList.appendChild(renderLoadingIndicator());
    }
    
    setTimeout(() => {
      scrollToBottom(state.conversationHistory.length > 0);
      updateScrollButton();
    }, 100);
  }
};

const handleMessageInputFocus = () => {
  // Update header gap when input is focused
  const headerContent = document.querySelector('.header-content');
  if (headerContent) {
    headerContent.classList.add('input-focused');
  }
  
  // Remove margin-top from input-area when input is focused for the first time
  // Keep it removed even after blur
  if (!state.hasInputBeenFocused) {
    const inputArea = document.querySelector('.input-area');
    if (inputArea) {
      inputArea.classList.add('input-focused');
      state.hasInputBeenFocused = true;
    }
  }
  
  if (!state.hasInputInteracted) {
    state.hasInputInteracted = true;
    renderMessages();
  }
};

const handleMessageInputBlur = () => {
  // Keep the input-focused class on input-area even after blur
  // This ensures margin-top stays removed once user has focused input at least once
  
  // Optionally revert header gap when input loses focus
  // Uncomment the code below if you want gap to revert when input loses focus
  // const headerContent = document.querySelector('.header-content');
  // if (headerContent) {
  //   headerContent.classList.remove('input-focused');
  // }
};

// Update send button state
const updateSendButton = () => {
  const hasText = elements.messageInput.value.trim().length > 0;
  elements.sendBtn.disabled = state.isLoading || state.connectionStatus === 'disconnected' || !hasText;
  
  // Get or create text div, img and p elements
  let textDiv = elements.sendBtn.querySelector('.text');
  let img = null;
  let p = null;
  let spinner = elements.sendBtn.querySelector('.spinner');
  
  // Ensure text div exists
  if (!textDiv) {
    textDiv = document.createElement('div');
    textDiv.className = 'text';
    elements.sendBtn.insertBefore(textDiv, elements.sendBtn.firstChild);
  }
  
  // Get or create img and p inside text div
  img = textDiv.querySelector('img');
  p = textDiv.querySelector('p');
  
  if (state.isLoading) {
    // Hide image
    if (img) img.style.display = 'none';
    
    // Show spinner (replace image)
    if (!spinner) {
      spinner = document.createElement('div');
      spinner.className = 'spinner';
      if (textDiv && textDiv.parentNode) {
        textDiv.parentNode.insertBefore(spinner, textDiv);
      } else {
        elements.sendBtn.insertBefore(spinner, elements.sendBtn.firstChild);
      }
    }
    spinner.style.display = 'block';
    
    // Update text to "Sending..."
    if (!p) {
      p = document.createElement('p');
      textDiv.appendChild(p);
    }
    p.textContent = 'Sending...';
    p.style.display = 'block';
    p.classList.add('send-btn-text-hidden');
  } else {
    // Hide spinner if it exists
    if (spinner) {
      spinner.style.display = 'none';
    }
    
    // Ensure image exists and is visible
    if (!img) {
      img = document.createElement('img');
      img.src = '/send.svg';
      img.alt = 'send';
      textDiv.insertBefore(img, textDiv.firstChild);
    }
    img.style.display = 'block';
    
    // Ensure paragraph exists and shows "send"
    if (!p) {
      p = document.createElement('p');
      textDiv.appendChild(p);
    }
    p.textContent = 'send';
    p.style.display = 'block';
    p.classList.remove('send-btn-text-hidden');
  }
};

// Send message handler
const handleSendMessage = async (messageContent, isRetry = false) => {
  if (!messageContent.trim()) return;

  // Clear any previous errors
  state.error = null;
  renderError(null);
  
  // Don't add user message again if this is a retry
  if (!isRetry) {
    state.retryCount = 0;
    
    // Add user message to conversation
    const userMessage = {
      id: generateMessageId(),
      role: 'user',
      content: messageContent,
      timestamp: new Date()
    };

    state.conversationHistory.push(userMessage);
    renderMessages();
  }
  
  state.isLoading = true;
  updateSendButton();

  try {
    // Send message to backend with conversation context using retry mechanism
    const response = await retryWithBackoff(
      () => chatApi.sendMessage(messageContent, state.conversationHistory),
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
    
    state.conversationHistory.push(aiMessage);
    state.retryCount = 0; // Reset retry count on success
    
    // Save to storage
    if (state.storageAvailable) {
      conversationStorage.saveConversation(state.conversationHistory);
    }
    
    renderMessages();
  } catch (err) {
    console.error('Failed to send message:', err);
    const errorInfo = getErrorMessage(err);
    state.error = errorInfo;
    renderError(errorInfo);
    
    // Remove the user message if the API call failed and this wasn't a retry
    if (!isRetry) {
      state.conversationHistory.pop();
      renderMessages();
    }
  } finally {
    state.isLoading = false;
    updateSendButton();
  }
};

// Clear conversation handler
const handleClearConversation = () => {
  try {
    conversationStorage.clearConversation();
    state.conversationHistory = [];
    state.sessionId = conversationStorage.getSessionId();
    state.error = null;
    state.retryCount = 0;
    renderMessages();
    renderError(null);
    // Conversation is already cleared in storage, so no need to save
  } catch (error) {
    console.error('Failed to clear conversation:', error);
    state.error = {
      message: 'Failed to clear conversation history',
      type: 'storage',
      retryable: false
    };
    renderError(state.error);
  }
};

// Retry last message handler
const handleRetryLastMessage = () => {
  if (state.conversationHistory.length === 0) return;
  
  // Find the last user message
  const lastUserMessage = [...state.conversationHistory].reverse().find(msg => msg.role === 'user');
  
  if (lastUserMessage) {
    state.retryCount += 1;
    handleSendMessage(lastUserMessage.content, true);
  }
};

// Check backend connection
const checkConnection = async (retryAttempt = 0) => {
  try {
    await chatApi.healthCheck();
    updateConnectionStatus('connected');
  } catch (err) {
    console.error('Backend connection failed:', err);
    
    if (retryAttempt < 2) {
      // Retry connection check up to 2 times
      setTimeout(() => checkConnection(retryAttempt + 1), 2000 * (retryAttempt + 1));
    } else {
      updateConnectionStatus('disconnected');
    }
  }
};

// Auto-resize textarea
const autoResizeTextarea = () => {
  elements.messageInput.style.height = 'auto';
  elements.messageInput.style.height = Math.min(elements.messageInput.scrollHeight, 120) + 'px';
};

// Initialize application
const init = () => {
  // Load conversation from localStorage
  try {
    const { messages, sessionId: storedSessionId } = conversationStorage.loadConversation();
    state.conversationHistory = messages;
    state.sessionId = storedSessionId;
    state.storageAvailable = conversationStorage.isStorageAvailable();
    
    if (!state.storageAvailable) {
      elements.storageWarning.style.display = 'inline';
      console.warn('localStorage not available - conversation will not persist');
    }
  } catch (error) {
    console.error('Failed to load conversation from storage:', error);
    state.storageAvailable = false;
    elements.storageWarning.style.display = 'inline';
  }
  
  // Render initial state
  renderMessages();
  updateSendButton();
  
  // Check backend connection
  checkConnection();
  
  // Event listeners
  elements.messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (elements.messageInput.value.trim() && !state.isLoading) {
      handleSendMessage(elements.messageInput.value.trim());
      elements.messageInput.value = '';
      autoResizeTextarea();
      updateSendButton();
    }
  });
  
  elements.messageInput.addEventListener('focus', handleMessageInputFocus);
  elements.messageInput.addEventListener('blur', handleMessageInputBlur);
  elements.messageInput.addEventListener('input', () => {
    autoResizeTextarea();
    updateSendButton();
  });
  
  elements.messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (elements.messageInput.value.trim() && !state.isLoading) {
        handleSendMessage(elements.messageInput.value.trim());
        elements.messageInput.value = '';
        autoResizeTextarea();
        updateSendButton();
      }
    }
  });
  
  elements.clearChatBtn.addEventListener('click', handleClearConversation);
  
  elements.scrollToBottomBtn.addEventListener('click', () => {
    scrollToBottom(true);
  });
  
  // Show/hide scroll to bottom button based on scroll position
  elements.messagesList.addEventListener('scroll', updateScrollButton);
  
  // Save conversation helper (already called in handleSendMessage, but available for other updates)
  const saveConversation = () => {
    if (state.conversationHistory.length > 0 && state.storageAvailable) {
      try {
        conversationStorage.saveConversation(state.conversationHistory);
      } catch (error) {
        console.error('Failed to save conversation to storage:', error);
        state.storageAvailable = false;
        elements.storageWarning.style.display = 'inline';
      }
    }
  };
};

// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

const magneto = document.querySelector('.magneto');
const magnetoText = document.querySelector('.magneto .text');

const activateMagneto = (event) => {
  let boundBox = magneto.getBoundingClientRect()
  const magnetoStrength = 25
  const magnetoTextStrength = 15
  const newX = ((event.clientX - boundBox.left) / magneto.offsetWidth) - 0.5
  const newY = ((event.clientY - boundBox.top) / magneto.offsetHeight) - 0.5

  gsap.to(magneto, {
    duration: 1,
    x: newX * magnetoStrength,
    y: newY * magnetoStrength,
    ease: "power4.out"
  }) 

  gsap.to(magnetoText, {
    duration: 1,
    x: newX * magnetoTextStrength,
    y: newY * magnetoTextStrength,
    ease: "power4.out"
  })
}

const resetMagneto= (event) => {
  gsap.to(magneto, {
    duration: 1,
    x: 0,
    y: 0,
    ease: 'elastic.out'
  })

  gsap.to(magnetoText, {
    duration: 1,
    x: 0,
    y: 0,
    ease: 'elastic.out'
  })
}

magneto.addEventListener('mousemove', activateMagneto)
magneto.addEventListener('mouseleave', resetMagneto)

