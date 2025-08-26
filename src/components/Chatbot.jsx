import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, MessageCircle, Download, Info, ChevronDown } from 'lucide-react';
import { chatWithOllama, checkOllamaStatus, getOllamaInstallInstructions } from '../services/ollamaService';
import { SYSTEM_PROMPT } from '../ai/systemPrompt';

const Chatbot = ({ userRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ollamaAvailable, setOllamaAvailable] = useState(false);
  const [showInstallInstructions, setShowInstallInstructions] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const chatWindowRef = useRef(null);

  // Don't show chatbot for super-admin
  if (userRole === 'super-admin') {
    return null;
  }

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeChat();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check if scroll button should be shown
  useEffect(() => {
    const handleScroll = () => {
      if (messagesContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        const isScrolledUp = scrollTop < scrollHeight - clientHeight - 100;
        setShowScrollButton(isScrolledUp);
      }
    };

    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  };

  const scrollToBottomInstant = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'auto',
        block: 'end'
      });
    }
  };

  const initializeChat = async () => {
    try {
      console.log('Checking Ollama availability...');
      const isAvailable = await checkOllamaStatus();
      
      setOllamaAvailable(isAvailable);
      
      if (isAvailable) {
        console.log('Ollama is available and ready to use');
        
        // Add initial system message for online mode
        const systemMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Hello! I'm Cuddles, your friendly NurseMate Assistant powered by Ollama. I'm here to help you with using NurseMate. How can I assist you today?`,
          timestamp: new Date()
        };
        
        setMessages([systemMessage]);
      } else {
        console.log('Ollama is not available, using offline mode');
        
        // Add initial system message for offline mode
        const systemMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Hello! I'm Cuddles, your friendly NurseMate Assistant. I'm currently running in offline mode with basic responses. I can help you with information about NurseMate features. For full AI capabilities, you can install Ollama.`,
          timestamp: new Date()
        };
        
        setMessages([systemMessage]);
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
      
      // Add error message but still allow offline mode
      const errorMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Hello! I'm Cuddles, your friendly NurseMate Assistant. I'm running in offline mode. I can still help you with basic information about NurseMate features.`,
        timestamp: new Date()
      };
      setMessages([errorMessage]);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      let responseContent;
      
      if (ollamaAvailable) {
        // Use Ollama with proper system prompt
        const systemPrompt = `${SYSTEM_PROMPT}\n\nCurrent user role: ${userRole}`;
        console.log('Sending to Ollama with system prompt:', { userMessage: inputValue, systemPrompt });
        
        responseContent = await chatWithOllama(inputValue, 'llama3', systemPrompt);
        console.log('Ollama response received:', responseContent);
        
        if (!responseContent) {
          throw new Error('No response received from Ollama');
        }
        
        // Clean up the response to remove markdown formatting and make it human-readable
        responseContent = responseContent
          .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting
          .replace(/\*(.*?)\*/g, '$1') // Remove italic formatting
          .replace(/`(.*?)`/g, '$1') // Remove code formatting
          .replace(/#{1,6}\s*(.*)/g, '$1') // Remove headers
          .replace(/- (.*)/g, '• $1') // Convert dashes to bullet points
          .replace(/\n\n/g, '\n') // Reduce excessive line breaks
          .replace(/\*\*Role handling:\*\*/g, 'Role handling:') // Clean up specific patterns
          .replace(/\*\*Style:\*\*/g, 'Style:') // Clean up specific patterns
          .replace(/\*\*If role = "nurse":\*\*/g, 'If you are a nurse:') // Make it more conversational
          .replace(/\*\*If role = "hospital-admin":\*\*/g, 'If you are a hospital admin:') // Make it more conversational
          .replace(/\*\*If role = "super-admin":\*\*/g, 'If you are a super admin:') // Make it more conversational
          .replace(/\*\*Important rules:\*\*/g, 'Here are some important things to remember:') // Make it conversational
          .replace(/\*\*For nurses:\*\*/g, 'If you are a nurse:') // Make it conversational
          .replace(/\*\*For hospital administrators:\*\*/g, 'If you are a hospital administrator:') // Make it conversational
          .replace(/\*\*For super admins:\*\*/g, 'If you are a super admin:') // Make it conversational
          .replace(/\*\*Always respond:\*\*/g, 'Remember to:') // Make it conversational
          .trim();
      } else {
        // Use fallback response system
        responseContent = await chatWithOllama(inputValue);
      }
      
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      
      let errorContent = 'Sorry, something went wrong. Please try again.';
      
      // Provide more specific error messages
      if (error.message.includes('No response received')) {
        errorContent = 'I had trouble processing your request. I can still help you with basic information about NurseMate features.';
      } else if (error.message.includes('timeout')) {
        errorContent = 'The request took too long. I can still help you with basic information about NurseMate features.';
      }
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorContent,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    if (isAnimating) return; // Prevent multiple clicks during animation
    
    setIsAnimating(true);
    
    if (!isOpen) {
      // Opening animation
      setIsOpen(true);
      setTimeout(() => {
        inputRef.current?.focus();
        setIsAnimating(false);
      }, 300); // Match the CSS transition duration
    } else {
      // Closing animation
      setIsAnimating(false);
      setIsOpen(false);
    }
  };

  const showInstallationInstructions = () => {
    const instructions = getOllamaInstallInstructions();
    const instructionMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: instructions,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, instructionMessage]);
    setShowInstallInstructions(false);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={toggleChat}
        disabled={isAnimating}
        className={`fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full chatbot-toggle-button transition-all duration-300 ease-out hover:scale-110 active:scale-95 ${
          isOpen ? 'rotate-180' : 'rotate-0'
        } ${isAnimating ? 'pointer-events-none' : ''}`}
        aria-label="Toggle chatbot"
      >
        <div className="relative w-7 h-7 flex items-center justify-center">
          <MessageCircle 
            size={24} 
            className={`absolute transition-all duration-300 ease-out ${
              isOpen ? 'opacity-0 rotate-180' : 'opacity-100 rotate-0'
            }`}
          />
          <X 
            size={24} 
            className={`absolute transition-all duration-300 ease-out ${
              isOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-180'
            }`}
          />
        </div>
      </button>

      {/* Chatbot Drawer */}
      <div
        ref={chatWindowRef}
        className={`fixed bottom-20 right-6 z-40 w-96 h-[600px] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col transition-all duration-300 ease-out transform ${
          isOpen 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2">
            <MessageSquare size={20} />
            <div>
              <h3 className="font-semibold">Cuddles</h3>
              <p className="text-xs opacity-80">
                {ollamaAvailable ? 'AI Powered' : 'Offline Mode'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!ollamaAvailable && (
              <button
                onClick={showInstallationInstructions}
                className="text-white hover:text-gray-200 transition-colors p-1 hover:scale-110 active:scale-95"
                title="Install Ollama for full AI capabilities"
              >
                <Download size={16} />
              </button>
            )}
            <button
              onClick={toggleChat}
              className="text-white hover:text-gray-200 transition-colors hover:scale-110 active:scale-95"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-3 chatbot-scrollbar"
          style={{ 
            scrollBehavior: 'smooth',
            maxHeight: 'calc(600px - 140px)' // Account for header and input
          }}
        >
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
              style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: 'both'
              }}
            >
              <div
                className={`max-w-[280px] px-3 py-2 rounded-lg message-bubble transition-all duration-200 hover:shadow-md ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm chat-message-content">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start animate-fade-in-up">
              <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Scroll to Bottom Button */}
        <button
          onClick={scrollToBottom}
          className={`absolute bottom-20 right-8 z-10 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-all duration-300 ease-out hover:scale-110 active:scale-95 ${
            showScrollButton 
              ? 'opacity-100 scale-100 translate-y-0' 
              : 'opacity-0 scale-75 translate-y-2 pointer-events-none'
          }`}
          title="Scroll to bottom"
        >
          <ChevronDown size={16} />
        </button>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={ollamaAvailable ? "Type your message..." : "Ask about NurseMate features..."}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Send size={16} />
            </button>
          </div>
          
          {!ollamaAvailable && (
            <div className="mt-2 text-xs text-gray-500 flex items-center space-x-1 animate-fade-in">
              <Info size={12} />
              <span>Offline mode - basic responses only</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Chatbot; 