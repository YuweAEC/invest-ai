import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Calendar, Trash2, Search, Filter, Download } from 'lucide-react'
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

  const loadSessionDetails = async (sessionId) => {
    try {
      const details = await chatService.getSessionHistory(sessionId)
      setSelectedSession(details)
    } catch (error) {
      console.error('Failed to load session details:', error)
    }
  }

  const deleteSession = async (sessionId) => {
    if (!confirm('Are you sure you want to delete this session?')) return

    try {
      await chatService.deleteSession(sessionId)
      setSessions(prev => prev.filter(s => s.session_id !== sessionId))
      if (selectedSession?.session_id === sessionId) {
        setSelectedSession(null)
      }
    } catch (error) {
      console.error('Failed to delete session:', error)
    }
  }

  const exportSession = (session) => {
    const dataStr = JSON.stringify(session, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `investai-session-${session.session_id}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString([], {
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-4"
        >
          {/* Search and Filter */}
          <div className="bg-white rounded-xl p-4 shadow-lg border border-neutral-200">
            <div className="flex items-center space-x-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <button className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors">
                <Filter className="w-4 h-4 text-neutral-600" />
              </button>
            </div>
          </div>

          {/* Sessions List */}
          <div className="space-y-3">
            {filteredSessions.map((session, index) => (
              <motion.div
                key={session.session_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => loadSessionDetails(session.session_id)}
                className={`bg-white rounded-xl p-4 shadow-lg border cursor-pointer transition-all ${
                  selectedSession?.session_id === session.session_id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <MessageCircle className="w-4 h-4 text-primary-600" />
                      <span className="text-sm font-medium text-neutral-600">
                        {formatDate(session.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-900 line-clamp-2">
                      {session.messages[0]?.user_query}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-neutral-500">
                      <span>{session.messages.length} messages</span>
                      {session.messages.some(msg => msg.ticker_symbol) && (
                        <span>Stock analysis</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        exportSession(session)
                      }}
                      className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors"
                      title="Export session"
                    >
                      <Download className="w-4 h-4 text-neutral-600" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteSession(session.session_id)
                      }}
                      className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition-colors"
                      title="Delete session"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Session Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-neutral-200"
        >
          {selectedSession ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-900">Session Details</h3>
                <div className="flex items-center space-x-2 text-sm text-neutral-600">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(selectedSession.created_at)}</span>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {selectedSession.messages.map((message, index) => (
                  <div key={index} className="border-b border-neutral-100 pb-3 last:border-b-0">
                    <div className="flex items-start space-x-3 mb-2">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-primary-600">
                          {message.user_query ? 'U' : 'AI'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-neutral-900">
                          {message.user_query || message.ai_response}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    {/* Additional Data */}
                    {message.stock_data && (
                      <div className="ml-11 p-3 bg-neutral-50 rounded-lg">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-neutral-600">Symbol:</span>
                            <span className="font-semibold ml-1">{message.ticker_symbol}</span>
                          </div>
                          <div>
                            <span className="text-neutral-600">Price:</span>
                            <span className="font-semibold ml-1">${message.stock_data.current_price}</span>
                          </div>
                          <div>
                            <span className="text-neutral-600">Change:</span>
                            <span className={`font-semibold ml-1 ${
                              message.stock_data.change_percent >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {message.stock_data.change_percent >= 0 ? '+' : ''}
                              {message.stock_data.change_percent}%
                            </span>
                          </div>
                          <div>
                            <span className="text-neutral-600">Sentiment:</span>
                            <span className="font-semibold ml-1">{message.sentiment_result}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600">Select a session to view details</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default History
