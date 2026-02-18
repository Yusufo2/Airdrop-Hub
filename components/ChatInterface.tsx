import React, { useState, useRef, useEffect } from 'react';
import { Chat, GenerateContentResponse } from '@google/genai';
import { createChatSession } from '../services/geminiService';
import { ChatMessage, MessageRole, ModelType } from '../types';
import { Button } from './ui/Button';
import { UserCircleIcon, CpuChipIcon, BoltIcon, PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [modelType, setModelType] = useState<ModelType>(ModelType.FLASH);
  
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat on mount or model change
  useEffect(() => {
    chatRef.current = createChatSession(modelType, "You are an expert Cryptocurrency Analyst and Airdrop Hunter. Your goal is to help users identify legitimate airdrop opportunities, explain DeFi concepts, analyze token economics, and warn them about potential scams. Be professional, cautious, yet helpful.");
    setMessages([{
        id: 'welcome',
        role: MessageRole.MODEL,
        text: "Hello! I'm your Crypto Analyst. Ask me about specific tokens, how to qualify for upcoming airdrops, or check if a project looks legitimate."
    }]); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelType]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isStreaming || !chatRef.current) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      text: inputValue
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsStreaming(true);

    const modelMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: modelMsgId,
      role: MessageRole.MODEL,
      text: '' // Start empty
    }]);

    try {
      const resultStream = await chatRef.current.sendMessageStream({ message: userMsg.text });
      
      let fullText = '';
      
      for await (const chunk of resultStream) {
        const c = chunk as GenerateContentResponse;
        const text = c.text;
        if (text) {
          fullText += text;
          setMessages(prev => prev.map(msg => 
            msg.id === modelMsgId ? { ...msg, text: fullText } : msg
          ));
        }
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => prev.map(msg => 
        msg.id === modelMsgId ? { ...msg, text: "Error generating response. Please try again.", isError: true } : msg
      ));
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 glass z-10">
        <div className="flex items-center space-x-3">
            <div className="p-1.5 bg-gradient-to-br from-secondary to-purple-600 rounded-lg shadow-lg shadow-secondary/20">
                <CpuChipIcon className="w-5 h-5 text-white" />
            </div>
            <div>
                <h3 className="font-bold text-white leading-tight">Airdrop Analyst AI</h3>
                <p className="text-[10px] text-slate-400">Powered by Gemini 3</p>
            </div>
        </div>
        <div className="flex space-x-2">
          <div className="relative">
            <select 
              value={modelType}
              onChange={(e) => setModelType(e.target.value as ModelType)}
              className="appearance-none bg-surfaceLight/50 text-xs font-medium text-slate-300 border border-white/10 rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-primary/50 hover:bg-surfaceLight transition-colors cursor-pointer"
            >
              <option value={ModelType.FLASH}>Gemini 3 Flash</option>
              <option value={ModelType.PRO}>Gemini 3 Pro</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
               <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 animate-pulse">
                <BoltIcon className="w-10 h-10 text-primary" />
            </div>
            <p className="text-lg font-medium text-slate-300">How can I help you hunt?</p>
            <p className="text-sm text-slate-500 mt-2">Ask about tokenomics, eligibility, or verify contracts.</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === MessageRole.USER ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
            <div className={`flex max-w-[90%] md:max-w-[80%] ${msg.role === MessageRole.USER ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 mx-2 shadow-lg ${
                  msg.role === MessageRole.USER 
                  ? 'bg-gradient-to-br from-primary to-blue-600' 
                  : 'bg-gradient-to-br from-secondary to-purple-600'
              }`}>
                {msg.role === MessageRole.USER ? <UserCircleIcon className="w-5 h-5 text-white" /> : <SparklesIcon className="w-4 h-4 text-white" />}
              </div>
              
              {/* Bubble */}
              <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-lg backdrop-blur-sm border ${
                msg.role === MessageRole.USER 
                  ? 'bg-gradient-to-br from-primary/80 to-blue-600/80 text-white rounded-tr-none border-transparent' 
                  : 'glass-card text-slate-200 rounded-tl-none border-white/10'
              }`}>
                {msg.isError ? (
                  <span className="text-red-300 flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full" />
                    {msg.text}
                  </span>
                ) : (
                   <ReactMarkdown 
                    className="markdown prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10"
                    components={{
                      code({node, inline, className, children, ...props}: any) {
                        return !inline ? (
                          <div className="relative group">
                            <div className="bg-black/40 p-3 rounded-lg border border-white/10 my-2 overflow-x-auto text-xs font-mono">
                                <code {...props} className={className}>{children}</code>
                            </div>
                          </div>
                        ) : (
                          <code {...props} className="bg-white/10 px-1 py-0.5 rounded text-xs font-mono text-primaryLight">{children}</code>
                        )
                      },
                      a: ({node, ...props}) => <a {...props} className="text-primary hover:text-primaryDark underline underline-offset-2 transition-colors" target="_blank" rel="noopener noreferrer" />
                    }}
                   >
                     {msg.text}
                   </ReactMarkdown>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 glass border-t border-white/5 z-20">
        <div className="relative max-w-4xl mx-auto">
             <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur opacity-20 transition-opacity duration-500 focus-within:opacity-50 pointer-events-none" />
             
            <div className="flex items-end gap-2 bg-surface/80 border border-white/10 rounded-2xl p-2 focus-within:ring-1 focus-within:ring-primary/50 focus-within:border-primary/50 transition-all shadow-xl">
            <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask specific questions about airdrops..."
                rows={1}
                className="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none resize-none py-3 px-3 max-h-32 min-h-[3rem] text-sm"
                style={{ height: 'auto' }}
                onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
                }}
            />
            <Button 
                onClick={handleSend} 
                disabled={!inputValue.trim() || isStreaming}
                className={`rounded-xl !p-0 h-10 w-10 flex-shrink-0 transition-all duration-300 ${inputValue.trim() ? 'bg-primary hover:bg-primaryDark text-white shadow-lg shadow-primary/20' : 'bg-white/5 text-slate-500'}`}
            >
                <PaperAirplaneIcon className={`w-5 h-5 ${isStreaming ? 'animate-pulse' : ''}`} />
            </Button>
            </div>
        </div>
      </div>
    </div>
  );
};