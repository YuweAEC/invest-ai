@echo off
REM InvestAI Startup Script for Windows

echo 🚀 Starting InvestAI - Conversational AI Platform for Investment Research
echo ==================================================================

REM Check if virtual environment exists
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
if exist "requirements.txt" (
    echo 📚 Installing dependencies...
    pip install -r requirements.txt
)

REM Check if .env file exists
if not exist ".env" (
    echo ⚠️  .env file not found. Creating from .env.example...
    copy .env.example .env
    echo 📝 Please edit .env file and add your NewsAPI key!
    echo    Get your free key at: https://newsapi.org
)

REM Start the application
echo 🌟 Starting FastAPI server...
echo    API Documentation: http://localhost:8000/docs
echo    Health Check: http://localhost:8000/health/simple
echo    Press Ctrl+C to stop the server
echo.

REM Run with uvicorn
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
