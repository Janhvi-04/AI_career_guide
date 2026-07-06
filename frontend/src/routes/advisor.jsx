if (typeof window !== 'undefined' && !window.process) {
  window.process = { title: 'browser', browser: true };
}
import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
export const Route = createFileRoute('/advisor')({
  component: Advisor
})
function Advisor() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hello! I am your AI Career Advisor. I can help you analyze market trends, evaluate compensation spectrum benchmarks, map out your technical stack growth path, or prepare for upcoming placement rounds. What are we strategizing today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatBottomRef = useRef(null)
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])
  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim()) return
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    setMessages(prev => [...prev, userMessage])
    const currentQuery = input
    setInput('')
    setIsTyping(true)
    const formattedHistory = messages
      .filter((_, index) => index > 0)
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }))
    try {
      const BASE_URL = import.meta.env.VITE_BACKEND_URL
      const response = await fetch(`${BASE_URL}/advisor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: currentQuery,
          history: formattedHistory
        })
      })
      const data = await response.json() 
      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: data.success && data.reply ? data.reply : "I am parsing recent market indices right now. Let's refine your target profile or tech stack objectives.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error(error)
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: "I encountered a synchronization issue loading telemetry updates. Let's re-verify terminal parameters.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ])
    } finally {
      setIsTyping(false)
    }
  }
  const handleResetChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'ai',
        text: "Initiated a clean matrix channel. Let's map out your next milestone or review profile architecture.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ])
    setInput('')
  }
  return (
    <div className='min-h-screen bg-slate-50 text-slate-800 p-4 md:p-6 font-sans antialiased flex flex-col h-screen overflow-hidden'>
      <div className='mx-auto max-w-5xl w-full flex-1 flex flex-col space-y-4 h-full min-h-0'>
        <div className='flex items-center justify-between shrink-0 px-1'>
          <Link to="/dashboard" className='inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition group'>
            <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <button
            onClick={handleResetChat}
            className="text-[10px] bg-slate-200/60 hover:bg-red-50 hover:text-red-600 hover:border-red-100 border border-transparent font-bold tracking-wider text-slate-600 px-3 py-1.5 rounded-xl uppercase transition-all"
          >
            Clear Chat
          </button>
        </div>
        <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm flex flex-col overflow-hidden flex-1 h-full min-h-0">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-2.5 w-2.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Advisor Stream</h3>
              </div>
            </div>
            <span className="text-[10px] bg-indigo-50 border border-indigo-100 font-extrabold tracking-wider text-indigo-600 px-3 py-1 rounded-full uppercase">
              AI Assistant Active
            </span>
          </div>
          <div className='flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50/10 custom-scrollbar'>
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} max-w-[85%] ${msg.sender === 'user' ? 'ml-auto' : 'mr-auto'}`}
              >
                <div 
                  className={`p-4 rounded-2xl text-xs leading-relaxed font-medium shadow-sm border ${
                    msg.sender === 'user' 
                      ? 'bg-indigo-600 text-white border-indigo-600 rounded-br-none' 
                      : 'bg-white text-slate-800 border-slate-100 rounded-bl-none'
                  }`}
                >
                  {msg.sender === 'user' ? (
                    msg.text
                  ) : (
                    <div className="prose prose-slate max-w-none text-xs space-y-2">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 font-bold tracking-wide mt-1 px-1 uppercase">
                  {msg.timestamp}
                </span>
              </div>
            ))}
            {isTyping && (
              <div className="flex flex-col items-start mr-auto max-w-[80%] animate-pulse">
                <div className="p-3 rounded-2xl bg-white border border-slate-100 text-xs text-slate-400 font-bold rounded-bl-none shadow-sm flex items-center gap-2">
                  <span className="flex gap-1">
                    <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </span>
                  Compiling strategic metrics...
                </div>
              </div>
            )}
            <div ref={chatBottomRef}/>
          </div>
          <div className="p-4 border-t border-slate-100 bg-white shrink-0">
            <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about resume metrics, technical target preparation, or role scaling..."
                className="flex-1 h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-medium outline-none focus:border-indigo-600 focus:bg-white text-slate-900 transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="h-12 px-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-indigo-100 disabled:shadow-none transition-all flex items-center justify-center shrink-0"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}