import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, TrendingUp, TrendingDown, Minus, Loader2, Sparkles, Brain, Zap } from 'lucide-react'
import { chatService } from '../services/api.js'

const ChatInterface = ({ sessionId, isDarkMode }) => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [userId] = useState(1)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setIsTyping(true)

    try {
      let response
      try {
        response = await chatService.sendQuery(userId, input)
      } catch (error) {
        console.log('Falling back to enhanced endpoint...')
        response = await chatService.sendMessage(input, sessionId)
      }

      setIsTyping(false)
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.response || response.ai_summary,
        timestamp: new Date().toISOString(),
        data: {
          stockData: response.stock_data,
          news: response.relevant_news || response.news,
          sentiment: response.sentiment_result,
          sources: response.sources,
          detectedTicker: response.detected_ticker,
        }
      }

      setTimeout(() => {
        setMessages(prev => [...prev, aiMessage])
        setIsLoading(false)
      }, 500)
    } catch (error) {
      setIsTyping(false)
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: `Sorry, I encountered an error: ${error.message}`,
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errorMessage])
      setIsLoading(false)
    }
  }

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getSentimentIcon = (sentiment) => {
    if (!sentiment) return null
    switch (sentiment.sentiment?.toLowerCase()) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-400" />
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-400" />
      default:
        return <Minus className="w-4 h-4 text-yellow-400" />
    }
  }

  const getSentimentColor = (sentiment) => {
    if (!sentiment) return 'text-neutral-400'
    switch (sentiment.sentiment?.toLowerCase()) {
      case 'positive':
        return 'text-green-400'
      case 'negative':
        return 'text-red-400'
      default:
        return 'text-yellow-400'
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8"
      >
        {/* Chat Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl neon-glow"
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold gradient-text">AI Investment Research</h2>
                <p className="text-neutral-400">Ask me anything about stocks, market trends, and financial news</p>
              </div>
            </div>
            
            <motion.div
              animate={{ 
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="flex items-center space-x-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full"
            >
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 text-sm">Online</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Messages Area */}
        <div className="h-96 overflow-y-auto p-4 space-y-4 chat-scroll mb-6">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                transition={{ 
                  duration: 0.5,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 300
                }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-lg px-6 py-4 rounded-2xl backdrop-blur-lg ${
                    message.type === 'user'
                      ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-white neon-glow'
                      : message.type === 'error'
                      ? 'bg-red-500/20 border border-red-500/30 text-red-300'
                      : 'bg-white/10 border border-white/20 text-neutral-100'
                  }`}
                >
                  {/* Message Header */}
                  {message.type === 'ai' && (
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {message.data?.detectedTicker && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400 }}
                            className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full font-bold shimmer"
                          >
                            {message.data.detectedTicker}
                          </motion.span>
                        )}
                        {message.data?.sentiment && (
                          <div className="flex items-center space-x-2">
                            {getSentimentIcon(message.data.sentiment)}
                            <span className={`text-xs font-medium ${getSentimentColor(message.data.sentiment)}`}>
                              {message.data.sentiment.sentiment}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-neutral-500">
                        {formatTimestamp(message.timestamp)}
                      </span>
                    </div>
                  )}

                  {/* Message Content */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-sm leading-relaxed whitespace-pre-wrap"
                  >
                    {message.content}
                  </motion.p>

                  {/* Stock Data */}
                  {message.data?.stockData && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mt-4 p-3 bg-white/10 rounded-xl border border-white/20"
                    >
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center space-x-2">
                          <Zap className="w-4 h-4 text-yellow-400" />
                          <span className="text-neutral-400">Price:</span>
                          <span className="font-semibold text-white">
                            ${message.data.stockData.current_price}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {message.data.stockData.change_percent >= 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-400" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                          )}
                          <span className="text-neutral-400">Change:</span>
                          <span className={`font-semibold ${
                            message.data.stockData.change_percent >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {message.data.stockData.change_percent >= 0 ? '+' : ''}
                            {message.data.stockData.change_percent}%
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* News Sources */}
                  {message.data?.sources && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="mt-3 text-xs text-neutral-500 flex items-center space-x-2"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Sources: {message.data.sources.join(', ')}</span>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex justify-start"
              >
                <div className="bg-white/10 border border-white/20 rounded-2xl px-6 py-4 backdrop-blur-lg">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-purple-400 animate-pulse" />
                    <div className="typing-indicator">
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative"
        >
          <div className="flex space-x-3">
            <motion.div
              whileFocus={{ scale: 1.02 }}
              className="flex-1 relative"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about any stock or investment topic..."
                className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-neutral-400 backdrop-blur-lg transition-all duration-300"
                disabled={isLoading}
              />
              {input && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                </motion.div>
              )}
            </motion.div>
            
            <motion.button
              type="submit"
              disabled={isLoading || !input.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-2 neon-glow hover-lift"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-5 h-5" />
                </motion.div>
              ) : (
                <Send className="w-5 h-5" />
              )}
              <span>{isLoading ? 'Analyzing...' : 'Send'}</span>
            </motion.button>
          </div>
        </motion.form>
      </motion.div>
    </div>
  )
}

export default ChatInterface
