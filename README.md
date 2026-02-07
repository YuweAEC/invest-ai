# InvestAI - Conversational AI Platform for Investment Research

![Python 3.12](https://img.shields.io/badge/python-3.12+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

A production-ready backend service that provides ChatGPT-like investment research capabilities using natural language processing, real-time market data, and AI-powered analysis.

## Features

- **Conversational AI**: Accept natural language investment queries (e.g., "How is Tesla doing this month?")
- **Real-Time Market Data**: Fetch current stock prices and historical trends using yfinance
- **News Integration**: Retrieve relevant financial news using NewsAPI
- **Sentiment Analysis**: Analyze news sentiment using TextBlob
- **AI Summary Generation**: Generate investor-friendly summaries using Hugging Face GPT-2
- **Conversation History**: Persist chat sessions in SQLite database
- **RESTful API**: FastAPI-based backend with auto-generated OpenAPI documentation

## Tech Stack

- **Python 3.12+** - Latest Python version with full compatibility
- **FastAPI** - Modern, fast web framework for building APIs
- **SQLAlchemy** - Powerful ORM for database operations
- **SQLite** - Lightweight database for conversation storage
- **yfinance** - Real-time market data from Yahoo Finance
- **NewsAPI** - Financial news integration and aggregation
- **TextBlob** - Simple sentiment analysis library
- **Hugging Face Transformers** - AI text generation (GPT-2)
- **Pydantic** - Data validation and settings management
- **Uvicorn** - High-performance ASGI server

## Quick Start

### Prerequisites

- Python 3.12 or higher (fully compatible)
- pip package manager
- NewsAPI key (get one at [https://newsapi.org](https://newsapi.org))

### Installation

1. **Clone or download the project**
   ```bash
   cd investai
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   
   # On Windows
   venv\\Scripts\\activate
   
   # On Unix/macOS
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env and add your NewsAPI key
   # NEWSAPI_KEY=your_actual_newsapi_key_here
   ```

5. **Run the application**
   ```bash
   # Using the run script
   ./run.sh
   
   # Or directly with uvicorn
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

6. **Access the API**
   - API Documentation: http://localhost:8000/docs
   - Health Check: http://localhost:8000/health/simple
   - Root Endpoint: http://localhost:8000/

## API Usage

### Chat Endpoint

Send a natural language investment query:

```bash
curl -X POST "http://localhost:8000/chat/" \\
     -H "Content-Type: application/json" \\
     -d '{
       "query": "How is Apple stock doing today?",
       "session_id": "optional-session-id"
     }'
```

**Response Example:**
```json
{
  "query": "How is Apple stock doing today?",
  "detected_ticker": "AAPL",
  "stock_data": {
    "symbol": "AAPL",
    "current_price": 175.43,
    "change_percent": 1.25,
    "volume": 52341234,
    "market_cap": 2750000000000
  },
  "sentiment_result": {
    "sentiment": "Positive",
    "confidence": 0.75,
    "polarity": 0.75
  },
  "ai_summary": "Apple (AAPL) is currently trading at $175.43, up 1.25% from the previous close. Recent news suggests positive sentiment around the company's latest product launches...",
  "relevant_news": [
    {
      "title": "Apple Reports Strong Q4 Earnings",
      "description": "Apple exceeded analyst expectations...",
      "source": "TechCrunch",
      "published_at": "2024-01-15T10:30:00Z",
      "url": "https://..."
    }
  ],
  "timestamp": "2024-01-15T15:30:00Z",
  "session_id": "generated-session-id"
}
```

### Session Management

**Get Chat History:**
```bash
curl "http://localhost:8000/chat/sessions/{session_id}"
```

**Get All Sessions:**
```bash
curl "http://localhost:8000/chat/sessions/"
```

**Delete Session:**
```bash
curl -X DELETE "http://localhost:8000/chat/sessions/{session_id}"
```

## Project Structure

```
investai/
├── app/
│   ├── main.py                 # FastAPI application entry point
│   ├── api/                    # API endpoints
│   │   ├── chat.py            # Chat functionality
│   │   └── health.py          # Health checks
│   ├── core/                   # Core configuration
│   │   ├── config.py          # Settings and environment variables
│   │   └── logger.py          # Logging configuration
│   ├── services/               # Business logic services
│   │   ├── market_data.py     # yfinance integration
│   │   ├── news_service.py    # NewsAPI integration
│   │   ├── sentiment.py       # TextBlob sentiment analysis
│   │   └── ai_engine.py       # GPT-2 text generation
│   ├── models/                 # SQLAlchemy database models
│   │   ├── chat.py            # Chat session and message models
│   │   └── session.py         # Session model
│   ├── schemas/                # Pydantic schemas
│   │   └── chat.py            # Request/response models
│   ├── db/                     # Database configuration
│   │   ├── base.py            # Database setup
│   │   └── session.py         # Session management
│   └── utils/                  # Utility functions
│       └── ticker_parser.py   # Ticker symbol extraction
├── .env.example               # Environment variables template
├── requirements.txt           # Python dependencies
├── README.md                  # This file
└── run.sh                     # Startup script
```

## Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Application Settings
APP_NAME=InvestAI
APP_VERSION=1.0.0
DEBUG=False

# Database Configuration
DATABASE_URL=sqlite:///./investai.db

# API Keys (Required for news functionality)
NEWSAPI_KEY=your_newsapi_key_here

# AI Model Settings
HUGGINGFACE_MODEL=gpt2
MAX_TOKENS=150
TEMPERATURE=0.7

# Server Configuration
API_HOST=0.0.0.0
API_PORT=8000
```

### Required API Keys

1. **NewsAPI Key**: Get a free key at [https://newsapi.org](https://newsapi.org)
   - Required for fetching financial news
   - Free tier allows up to 1,000 requests per day

## Development

### Running in Development Mode

```bash
# Activate virtual environment
source venv/bin/activate  # Unix/macOS
# or
venv\\Scripts\\activate   # Windows

# Run with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Database

The application uses SQLite by default. The database file (`investai.db`) will be created automatically when you first run the application.

### Adding New Features

1. **New API endpoints**: Add to `app/api/`
2. **Business logic**: Add to `app/services/`
3. **Database models**: Add to `app/models/`
4. **Request/response schemas**: Add to `app/schemas/`

## Production Deployment

### Docker (Future Enhancement)

The project is structured to be containerizable. A future enhancement would include:

```dockerfile
FROM python:3.10-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Cloud Deployment

The application can be deployed to:
- **Heroku**: Easy deployment with PostgreSQL
- **AWS**: Using Elastic Beanstalk or ECS
- **Google Cloud**: Using Cloud Run
- **Azure**: Using App Service

## Future Enhancements

- **User Authentication**: JWT-based authentication system
- **User Dashboard**: Streamlit frontend for visualization
- **Advanced LLMs**: Support for Llama 3, Grok, xAI API
- **Real-time WebSocket**: Live stock price updates
- **Portfolio Management**: Track multiple stocks
- **Advanced Analytics**: Technical indicators and chart patterns
- **Multi-language Support**: Support for international markets

## Troubleshooting

### Common Issues

1. **ModuleNotFoundError**: Ensure virtual environment is activated
2. **NewsAPI errors**: Check your API key in `.env`
3. **Database errors**: Ensure write permissions in the project directory
4. **Model loading errors**: First run may take time to download GPT-2 model

### Logs

Application logs are printed to console. Check for error messages during startup.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is for educational and demonstration purposes.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation at `/docs`
3. Check application logs for detailed error messages
