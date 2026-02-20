#!/bin/bash

# InvestAI Startup Script

echo "🚀 Starting InvestAI - Conversational AI Platform for Investment Research"
echo "=================================================================="

# Set environment variable to suppress TensorFlow warnings
export TF_ENABLE_ONEDNN_OPTS=0

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies if requirements.txt has changed
if [ -f "requirements.txt" ]; then
    echo "📚 Installing dependencies..."
    pip install -r requirements.txt
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "📝 Please edit .env file and add your NewsAPI key!"
    echo "   Get your free key at: https://newsapi.org"
fi

# Start application
echo "🌟 Starting FastAPI server..."
echo "   API Documentation: http://localhost:8000/docs"
echo "   Health Check: http://localhost:8000/health/simple"
echo "   Press Ctrl+C to stop the server"
echo ""

# Run with uvicorn
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
