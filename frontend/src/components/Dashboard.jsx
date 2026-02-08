import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Activity, Globe } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { chatService } from '../services/api.js'

const Dashboard = ({ sessionId, isDarkMode }) => {
  const [marketData, setMarketData] = useState([])
  const [topStocks, setTopStocks] = useState([])
  const [sentimentData, setSentimentData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Simulate fetching recent queries and their results
        const sessions = await chatService.getAllSessions()
        
        // Extract stock data from recent sessions
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

        // Get top performing stocks
        const topPerformers = stocks
          .sort((a, b) => b.change - a.change)
          .slice(0, 5)

        // Calculate sentiment distribution
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

        // Generate mock historical data for charts
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Queries', value: '1,234', icon: Activity, color: 'blue' },
          { title: 'Active Sessions', value: '89', icon: Globe, color: 'green' },
          { title: 'Avg. Response Time', value: '1.2s', icon: BarChart3, color: 'purple' },
          { title: 'Success Rate', value: '98.5%', icon: TrendingUp, color: 'emerald' },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-neutral-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">{stat.title}</p>
                <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Trends Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-neutral-200"
        >
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Market Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={marketData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Sentiment Analysis */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-neutral-200"
        >
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Sentiment Analysis</h3>
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
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Top Performing Stocks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-lg border border-neutral-200"
      >
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Top Performing Stocks</h3>
        <div className="space-y-3">
          {topStocks.map((stock, index) => (
            <div key={stock.symbol} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-600">{stock.symbol}</span>
                </div>
                <div>
                  <p className="font-medium text-neutral-900">{stock.symbol}</p>
                  <p className="text-sm text-neutral-600">{formatPrice(stock.price)}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`flex items-center space-x-1 ${
                  stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stock.change >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span className="font-semibold">
                    {stock.change >= 0 ? '+' : ''}{stock.change}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default Dashboard
