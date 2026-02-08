import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain, TrendingUp, BarChart3, MessageCircle, Sun, Moon, Settings } from 'lucide-react'

const Header = ({ isDarkMode, toggleDarkMode }) => {
  const location = useLocation()

  const navigation = [
    { name: 'Chat', href: '/', icon: MessageCircle },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'History', href: '/history', icon: TrendingUp },
  ]

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-50"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 bg-primary-600 rounded-lg group-hover:bg-primary-700 transition-colors">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-900">InvestAI</h1>
              <p className="text-xs text-neutral-600">AI Investment Research</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-neutral-700" />
              ) : (
                <Moon className="w-5 h-5 text-neutral-700" />
              )}
            </button>

            {/* Settings */}
            <button className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors">
              <Settings className="w-5 h-5 text-neutral-700" />
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  )
}

export default Header
