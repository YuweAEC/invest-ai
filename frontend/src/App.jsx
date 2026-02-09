import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, TrendingUp, BarChart3, Settings, Brain, Sparkles } from 'lucide-react'
import Header from './components/Header.jsx'
import ChatInterface from './components/ChatInterface.jsx'
import Dashboard from './components/Dashboard.jsx'
import History from './components/History.jsx'
import { chatService } from './services/api.js'

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [sessionId, setSessionId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Generate session ID on app load
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    setSessionId(newSessionId)
    
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1500)
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute inset-0 w-16 h-16 bg-purple-500/20 rounded-full pulse-glow"
            />
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-2xl font-bold gradient-text"
          >
            InvestAI
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-2 text-neutral-400"
          >
            Initializing AI Investment Research...
          </motion.p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl float-animation" />
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl float-animation" style={{ animationDelay: '3s' }} />
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full filter blur-3xl float-animation" style={{ animationDelay: '6s' }} />
        </div>

        <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        
        <main className="container mx-auto px-4 py-8 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="max-w-6xl mx-auto"
            >
              <Routes>
                <Route 
                  path="/" 
                  element={
                    <ChatInterface 
                      sessionId={sessionId} 
                      isDarkMode={isDarkMode}
                    />
                  } 
                />
                <Route 
                  path="/dashboard" 
                  element={
                    <Dashboard 
                      sessionId={sessionId} 
                      isDarkMode={isDarkMode}
                    />
                  } 
                />
                <Route 
                  path="/history" 
                  element={
                    <History 
                      sessionId={sessionId} 
                      isDarkMode={isDarkMode}
                    />
                  } 
                />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

export default App
