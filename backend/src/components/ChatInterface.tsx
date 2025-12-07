import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import ChatBackground from './ChatBackground';

const ChatInterface: React.FC = () => {
  const { messages, isTyping, isLoading, sendMessage, searchMode, toggleSearchMode, stopGenerating, creativityLevel, setCreativityLevel } = useChat();
  const [input, setInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-black relative">
      {/* Animated Background */}
      <ChatBackground />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar relative z-10">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-5 py-3 ${msg.type === 'user'
                ? 'bg-[#2873ec] text-white rounded-bl-none'
                : 'bg-gray-900 text-gray-200 border border-[#2873ec]/20 rounded-br-none'
                }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>

              {/* Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700/50">
                  <p className="text-xs text-gray-400 mb-2 font-medium">المصادر:</p>
                  <div className="flex flex-wrap gap-2">
                    {msg.sources.map((source, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-gray-800 text-blue-400 px-2 py-1 rounded border border-blue-500/20 flex items-center space-x-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>{source.file} (p. {source.page})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <p className={`text-[10px] mt-1 ${msg.type === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-900 border border-[#2873ec]/20 rounded-2xl rounded-br-none px-4 py-3 flex items-center space-x-1 space-x-reverse">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-black border-t border-[#2873ec]/20 relative z-10">
        {/* Stop Generating Button */}
        {(isLoading || isTyping) && (
          <div className="max-w-4xl mx-auto mb-3 flex justify-center">
            <button
              onClick={stopGenerating}
              className="px-4 py-2 bg-red-600/20 border border-red-500/40 text-red-400 rounded-lg hover:bg-red-600/30 transition-all duration-300 flex items-center space-x-2 space-x-reverse shadow-[0_0_15px_rgba(239,68,68,0.2)]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">إيقاف الرد</span>
            </button>
          </div>
        )}

        <div className="max-w-4xl mx-auto relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={searchMode ? "اطرح سؤالاً للبحث..." : "اكتب رسالتك..."}
            className="w-full bg-gray-900/50 text-white rounded-xl pl-4 pr-32 py-3 focus:outline-none focus:ring-1 focus:ring-[#2873ec] border border-[#2873ec]/20 resize-none max-h-[150px] custom-scrollbar text-right"
            rows={1}
            style={{ minHeight: '50px' }}
            disabled={isLoading || isTyping}
          />

          <div className="absolute left-2 top-6.5 -translate-y-1/2 flex items-center space-x-1 space-x-reverse">
            {/* Settings Menu */}
            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                title="الإعدادات"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>

              {showSettings && (
                <div className="absolute bottom-full left-0 mb-2 w-64 bg-gray-900 border border-[#2873ec]/30 rounded-lg shadow-xl p-4 space-y-4">
                  {/* Search Mode Toggle */}
                  <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                    <label className="text-sm text-gray-300">وضع البحث</label>
                    <button
                      onClick={toggleSearchMode}
                      className={`relative w-12 h-6 rounded-full transition-colors ${searchMode ? 'bg-[#2873ec]' : 'bg-gray-700'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${searchMode ? 'right-1' : 'right-7'}`}></div>
                    </button>
                  </div>

                  {/* Creativity Slider */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm text-gray-300">مستوى الإبداع</label>
                      <span className="text-xs text-[#2873ec] font-semibold">{creativityLevel}%</span>
                    </div>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="10"
                        value={creativityLevel}
                        onChange={(e) => setCreativityLevel(Number(e.target.value))}
                        className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#2873ec] [&::-webkit-slider-thumb]:shadow-[0_0_10px_#2873ec]"
                      />
                      <div className="flex justify-between text-[10px] text-gray-500">
                        <span>التزام</span>
                        <span>إبداع</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              title="رفع صورة"
              disabled={isLoading || isTyping}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>

            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading || isTyping}
              className={`p-2 rounded-lg transition-all duration-300 ${input.trim() && !isLoading && !isTyping
                ? 'bg-[#2873ec] text-white shadow-[0_0_10px_rgba(40,115,236,0.3)] hover:shadow-[0_0_15px_rgba(74,143,255,0.5)]'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="text-center mt-2">
          <p className="text-[10px] text-gray-500">يمكن للذكاء الاصطناعي أن يرتكب أخطاء. يرجى التحقق من المعلومات المهمة.</p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
