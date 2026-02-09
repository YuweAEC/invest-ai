import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Activity, Globe, Zap, Sparkles } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import { chatService } from '../services/api.js'

const Dashboard = ({ sessionId, isDarkMode }) => {
  const [marketData, setMarketData] = useState([])
  const [topStocks, setTopStocks] = useState([])
  const [sentimentData, setSentimentData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const sessions = await chatService.getAllSessions()
        
        const stocks = sessions.flatMap(session => 
          session.messages
            .filter(msg => msg.stock_data)
            .map(msg => ({
              symbol: msg.ticker_symbol,
              price: msg.stock_data.current_price,
              change: msg.stock_data.change_percent,
              timestamp: msg.created_at
            }))
        )

        const topPerformers = stocks
          .sort((a, b) => b.change - a.change)
          .slice(0, 5)

        const sentimentCounts = sessions.flatMap(session =>
          session.messages
            .filter(msg => msg.sentiment_result)
            .map(msg => msg.sentiment_result)
        ).reduce((acc, sentiment) => {
          acc[sentiment] = (acc[sentiment] || 0) + 1
          return acc
        }, {})

        const sentimentChartData = Object.entries(sentimentCounts).map(([name, value]) => ({
          name,
          value,
          color: name === 'Positive' ? '#22c55e' : name === 'Negative' ? '#ef4444' : '#64748b'
        }))

        const historicalData = [
          { date: 'Mon', value: 100, volume: 2400 },
          { date: 'Tue', value: 102, volume: 2210 },
          { date: 'Wed', value: 98, volume: 2290 },
          { date: 'Thu', value: 105, volume: 2000 },
          { date: 'Fri', value: 110, volume: 2181 },
        ]

        setMarketData(historicalData)
        setTopStocks(topPerformers)
        setSentimentData(sentimentChartData)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [sessionId])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Queries', value: '1,234', icon: Activity, color: 'purple', change: '+12%' },
          { title: 'Active Sessions', value: '89', icon: Globe, color: 'blue', change: '+5%' },
          { title: 'Avg Response Time', value: '1.2s', icon: BarChart3, color: 'green', change: '-0.3s' },
          { title: 'Success Rate', value: '98.5%', icon: TrendingUp, color: 'pink', change: '+2%' },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="glass-card p-6 hover-lift"
          >
            <div className="flex items-center justify-between mb-4">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.2
                }}
                className={`p-3 bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 rounded-xl neon-glow`}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </motion.div>
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`text-${stat.color}-400 text-sm font-semibold`}
              >
                {stat.change}
              </motion.span>
            </div>
            <div>
              <p className="text-neutral-400 text-sm mb-1">{stat.title}</p>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="text-2xl font-bold gradient-text"
              >
                {stat.value}
              </motion.p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Market Trends Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 hover-lift"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold gradient-text">Market Trends</h3>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="p-2 bg-purple-500/20 rounded-lg"
            >
              <Activity className="w-4 h-4 text-purple-400" />
            </motion.div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={marketData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)'
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#a855f7"
                strokeWidth={2}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Sentiment Analysis */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6 hover-lift"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold gradient-text">Sentiment Analysis</h3>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="p-2 bg-pink-500/20 rounded-lg"
            >
              <Sparkles className="w-4 h-4 text-pink-400" />
            </motion.div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
              >
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Top Performing Stocks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-6 hover-lift"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold gradient-text">Top Performing Stocks</h3>
          <motion.div
            animate={{ 
              translateY: [0, -5, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-2 bg-green-500/20 rounded-lg"
          >
            <TrendingUp className="w-4 h-4 text-green-400" />
          </motion.div>
        </div>
        <div className="space-y-4">
          {topStocks.map((stock, index) => (
            <motion.div
              key={stock.symbol}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              whileHover={{ scale: 1.02, x: 5 }}
              className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:border-purple-500/30 transition-all duration-300"
            >
              <div className="flex items-center space-x-4">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.3
                  }}
                  className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center neon-glow"
                >
                  <span className="text-sm font-bold text-white">{stock.symbol}</span>
                </motion.div>
                <div>
                  <p className="font-semibold text-white">{stock.symbol}</p>
                  <p className="text-sm text-neutral-400">{formatPrice(stock.price)}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`flex items-center space-x-2 ${
                  stock.change >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stock.change >= 0 ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <TrendingDown className="w-5 h-5" />
                  )}
                  <span className="font-bold text-lg">
                    {stock.change >= 0 ? '+' : ''}{stock.change}%
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default Dashboard
