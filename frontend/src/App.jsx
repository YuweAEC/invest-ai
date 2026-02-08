import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MessageCircle, TrendingUp, BarChart3, Settings, Brain } from 'lucide-react'
import Header from './components/Header.jsx'
import ChatInterface from './components/ChatInterface.jsx'
import Dashboard from './components/Dashboard.jsx'
import History from './components/History.jsx'
import { api } from './services/api.js'

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [sessionId, setSessionId] = useState(null)

  useEffect(() => {
    // Generate session ID on app load
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    setSessionId(newSessionId)
    
    // Check for dark mode preference
    const darkMode = localStorage.getItem('darkMode') === 'true'
    setIsDarkMode(darkMode)
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode)
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="bg-gradient-to-br from-primary-50 to-white min-h-screen">
        <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        
        <main className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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
        </main>
      </div>
    </div>
  )
}

export default App
