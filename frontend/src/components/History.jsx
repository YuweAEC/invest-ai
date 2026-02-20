import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Calendar, Trash2, Search, Filter, Download, Sparkles, Clock, TrendingUp, Globe } from 'lucide-react'
import { chatService } from '../services/api.js'

const History = ({ sessionId, isDarkMode }) => {
  const [sessions, setSessions] = useState([])
  const [selectedSession, setSelectedSession] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await chatService.getAllSessions()
        setSessions(data)
      } catch (error) {
        console.error('Failed to fetch sessions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSessions()
  }, [])

  const filteredSessions = sessions.filter(session =>
    session.messages.some(msg =>
      msg.user_query.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.ai_response.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const handleDeleteSession = async (sessionId) => {
    try {
      await chatService.deleteSession(sessionId)
      setSessions(sessions.filter(s => s.session_id !== sessionId))
      if (selectedSession?.session_id === sessionId) {
        setSelectedSession(null)
      }
    } catch (error) {
      console.error('Failed to delete session:', error)
    }
  }

  const handleExportSession = (session) => {
    const dataStr = JSON.stringify(session, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `session_${session.session_id}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity
            }}
            className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl neon-glow"
          >
            <Clock className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold gradient-text">Session History</h2>
            <p className="text-neutral-400">View and manage your past conversations</p>
          </div>
        </div>
        
        <motion.div
          animate={{ 
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity
          }}
          className="flex items-center space-x-2 px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full"
        >
          <Globe className="w-4 h-4 text-purple-400" />
          <span className="text-purple-400 text-sm">{sessions.length} Sessions</span>
        </motion.div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <div className="flex items-center space-x-4">
          <motion.div
            whileFocus={{ scale: 1.02 }}
            className="flex-1 relative"
          >
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-neutral-400 backdrop-blur-lg transition-all duration-300"
            />
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300"
          >
            <Filter className="w-5 h-5 text-neutral-400" />
          </motion.button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sessions List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1 space-y-4"
        >
          <AnimatePresence>
            {filteredSessions.map((session, index) => (
              <motion.div
                key={session.session_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                onClick={() => setSelectedSession(session)}
                className={`glass-card p-4 cursor-pointer hover-lift ${
                  selectedSession?.session_id === session.session_id
                    ? 'border-purple-500/50 neon-glow'
                    : 'border-white/10'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.2
                      }}
                      className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg"
                    >
                      <MessageCircle className="w-4 h-4 text-purple-400" />
                    </motion.div>
                    <div>
                      <p className="font-semibold text-white">Session {session.session_id.slice(-8)}</p>
                      <p className="text-xs text-neutral-400">{formatDate(session.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleExportSession(session)
                      }}
                      className="p-1 text-neutral-400 hover:text-white transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteSession(session.session_id)
                      }}
                      className="p-1 text-neutral-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-xs text-neutral-400">
                  <span>{session.messages.length} messages</span>
                  <span>•</span>
                  <span>{session.messages.filter(msg => msg.ticker_symbol).length} stocks</span>
                </div>
                
                <p className="mt-2 text-sm text-neutral-300 truncate">
                  {session.messages[0]?.user_query || 'No messages'}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Session Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          {selectedSession ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity
                    }}
                    className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl neon-glow"
                  >
                    <Sparkles className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold gradient-text">Session Details</h3>
                    <p className="text-neutral-400">{formatDate(selectedSession.created_at)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <motion.div
                    animate={{ 
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity
                    }}
                    className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full"
                  >
                    <span className="text-green-400 text-sm">{selectedSession.messages.length} Messages</span>
                  </motion.div>
                </div>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto chat-scroll">
                <AnimatePresence>
                  {selectedSession.messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-xl backdrop-blur-lg ${
                        index % 2 === 0
                          ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20'
                          : 'bg-white/10 border border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-neutral-400">
                          {index % 2 === 0 ? 'User' : 'AI'}
                        </span>
                        {message.ticker_symbol && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400 }}
                            className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full font-semibold shimmer"
                          >
                            {message.ticker_symbol}
                          </motion.span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-100">{index % 2 === 0 ? message.user_query : message.ai_response}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-12 text-center"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity
                }}
                className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4 neon-glow"
              >
                <Calendar className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold gradient-text mb-2">No Session Selected</h3>
              <p className="text-neutral-400">Select a session from list to view details</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default History
