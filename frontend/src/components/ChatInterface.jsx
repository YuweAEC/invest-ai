import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, TrendingUp, TrendingDown, Minus, Loader2, Sparkles } from 'lucide-react'
import { chatService } from '../services/api.js'

const ChatInterface = ({ sessionId, isDarkMode }) => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [userId] = useState(1) // Default user ID for company-specified endpoint
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

    try {
      // Try company-specified endpoint first
      let response
      try {
        response = await chatService.sendQuery(userId, input)
      } catch (error) {
        // Fallback to enhanced endpoint
        console.log('Falling back to enhanced endpoint...')
        response = await chatService.sendMessage(input, sessionId)
      }

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

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: `Sorry, I encountered an error: ${error.message}`,
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
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
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-500" />
      default:
        return <Minus className="w-4 h-4 text-yellow-500" />
    }
  }

  const getSentimentColor = (sentiment) => {
    if (!sentiment) return 'text-neutral-600'
    switch (sentiment.sentiment?.toLowerCase()) {
      case 'positive':
        return 'text-green-600'
      case 'negative':
        return 'text-red-600'
      default:
        return 'text-yellow-600'
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl border border-neutral-200"
      >
        {/* Chat Header */}
        <div className="border-b border-neutral-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Sparkles className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-neutral-900">AI Investment Research</h2>
              <p className="text-sm text-neutral-600">Ask me anything about stocks, market trends, and financial news</p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="h-96 overflow-y-auto p-6 space-y-4 chat-scroll">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-md px-4 py-3 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-primary-600 text-white'
                      : message.type === 'error'
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : 'bg-neutral-100 text-neutral-800 border border-neutral-200'
                  }`}
                >
                  {/* Message Header */}
                  {message.type === 'ai' && (
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {message.data?.detectedTicker && (
                          <span className="px-2 py-1 bg-primary-600 text-white text-xs rounded-full font-semibold">
                            {message.data.detectedTicker}
                          </span>
                        )}
                        {message.data?.sentiment && (
                          <div className="flex items-center space-x-1">
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
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>

                  {/* Stock Data */}
                  {message.data?.stockData && (
                    <div className="mt-3 p-3 bg-white/50 rounded-lg border border-neutral-200">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-neutral-600">Current Price:</span>
                          <span className="font-semibold text-neutral-900 ml-1">
                            ${message.data.stockData.current_price}
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-600">Change:</span>
                          <span className={`font-semibold ml-1 ${
                            message.data.stockData.change_percent >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {message.data.stockData.change_percent >= 0 ? '+' : ''}
                            {message.data.stockData.change_percent}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* News Sources */}
                  {message.data?.sources && (
                    <div className="mt-2 text-xs text-neutral-500">
                      Sources: {message.data.sources.join(', ')}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="border-t border-neutral-200 p-4">
          <div className="flex space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about any stock or investment topic..."
              className="flex-1 px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>{isLoading ? 'Analyzing...' : 'Send'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default ChatInterface
