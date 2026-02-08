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

## Frontend Features

### **Modern React Interface**
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Chat**: Interactive conversation with AI
- **Dashboard**: Analytics and market insights
- **Session History**: Track and manage conversations
- **Dark Mode**: Toggle between light and dark themes
- **Stock Data Display**: Real-time prices and changes
- **Sentiment Visualization**: Charts and indicators
- **Export Functionality**: Download session data

### **Frontend Tech Stack**
- **React 18** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations
- **Lucide React** - Beautiful icons
- **Recharts** - Data visualization
- **Axios** - HTTP client with interceptors

### **UI/UX Features**
- **Professional Design**: Clean, modern interface
- **Smooth Animations**: Micro-interactions and transitions
- **Color Scheme**: Primary blue with neutral grays
- **Typography**: Inter font for readability
- **Loading States**: Skeleton screens and spinners
- **Error Handling**: User-friendly error messages
- **Responsive Layout**: Mobile-first design

## Quick Start

### Prerequisites

- Python 3.12 or higher (fully compatible)
- Node.js 16+ and npm
- pip package manager
- NewsAPI key (get one at [https://newsapi.org](https://newsapi.org))

### Installation

#### **Backend Setup**

1. **Navigate to project**
   ```bash
   cd investai
   ```

2. **Create and activate virtual environment**
   ```bash
   python -m venv venv
   
   # On Windows
   venv\\Scripts\\activate
   
   # On Unix/macOS
   source venv/bin/activate
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your NewsAPI key
   ```

5. **Start backend server**
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

#### **Frontend Setup**

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

3. **Start frontend development server**
   ```bash
   npm run dev
   ```

### **Running the Full Application**

1. **Start backend** (Terminal 1):
   ```bash
   cd investai
   source venv/Scripts/activate  # Windows
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. **Start frontend** (Terminal 2):
   ```bash
   cd investai/frontend
   npm run dev
   ```

3. **Access the application**:
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8000
   - **API Documentation**: http://localhost:8000/docs

6. **Access the API**
   - API Documentation: http://localhost:8000/docs
   - Health Check: http://localhost:8000/health/simple
   - Root Endpoint: http://localhost:8000/

## API Usage Example

### **Company Specified Endpoint:**
**Endpoint**: `POST /query`

**Request:**
```json
{
  "user_id": 1,
  "query": "Analyze AAPL stock performance"
}
```

**Sample Response:**
```json
{
  "response": "Apple Inc. (AAPL) is trading at $175.20, up 2.1% today. Over the past month, it gained 8.4%. Recent news shows positive sentiment around iPhone sales and AI initiatives. Overall news sentiment: Positive",
  "sources": ["Yahoo Finance", "NewsAPI"],
  "user_id": 1,
  "timestamp": "2026-02-08T03:23:00.000Z"
}
```

### **Alternative Endpoint:**
**Endpoint**: `POST /chat/` (Enhanced version with more features)

**Request:**
```json
{
  "query": "How is Apple stock doing today?",
  "session_id": "optional-session-id"
}
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
├── app/                          # Backend FastAPI application
│   ├── main.py                 # FastAPI app entry point
│   ├── api/                    # API endpoints
│   │   ├── chat.py            # Enhanced chat endpoint
│   │   ├── query.py           # Company-specified endpoint
│   │   └── health.py          # Health checks
│   ├── core/                   # Core configuration
│   │   ├── config.py          # Settings management
│   │   └── logger.py          # Logging setup
│   ├── services/               # Business logic services
│   │   ├── market_data.py     # yfinance integration
│   │   ├── news_service.py    # NewsAPI integration
│   │   ├── sentiment.py       # TextBlob analysis
│   │   ├── ai_engine.py       # GPT-2 generation
│   │   ├── ai_service.py     # AI service wrapper
│   │   ├── data_service.py   # Data service wrapper
│   │   └── analysis_service.py # Analysis service wrapper
│   ├── models/                 # Database models
│   │   ├── chat.py            # Chat sessions/messages
│   │   └── session.py         # Session management
│   ├── schemas/                # Pydantic validation
│   │   ├── chat.py            # Chat request/response models
│   │   └── query.py           # Query request/response models
│   ├── db/                     # Database setup
│   │   ├── base.py            # SQLAlchemy configuration
│   │   └── session.py         # Session management
│   └── utils/                  # Utilities
│       └── ticker_parser.py   # Ticker extraction
├── frontend/                      # Modern React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── ChatInterface.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── History.jsx
│   │   │   └── Header.jsx
│   │   ├── services/          # API services
│   │   │   └── api.js
│   │   ├── App.jsx            # Main React app
│   │   ├── main.jsx           # React entry point
│   │   └── index.css          # Tailwind CSS
│   ├── package.json             # Node.js dependencies
│   ├── vite.config.js          # Vite configuration
│   ├── tailwind.config.js      # Tailwind CSS config
│   └── index.html             # HTML template
├── app.py                        # Simplified entry point
├── models.py                     # Consolidated models
├── schemas.py                    # Consolidated schemas
├── .env                          # Environment variables
├── .env.example               # Environment template
├── requirements.txt           # Python dependencies
├── README.md               # This file
├── run.bat                 # Windows startup script
└── run.sh                  # Unix startup script
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
- **AWS**: Elastic Beanstalk or ECS
- **Google Cloud**: Cloud Run or App Engine
- **Azure**: App Service or Container Instances

### Frontend Deployment

#### Static Hosting
```bash
cd frontend
npm run build
# Deploy dist/ folder to Netlify, Vercel, or GitHub Pages
```

#### Full-Stack Deployment
- **Vercel**: Connect both frontend and backend
- **Netlify**: Static frontend with serverless functions
- **AWS Amplify**: Full-stack hosting
- **DigitalOcean**: App Platform for full applications

### Environment Configuration
```env
# Production
DEBUG=False
API_HOST=0.0.0.0
API_PORT=8000
DATABASE_URL=postgresql://user:pass@host:port/dbname
NEWSAPI_KEY=production_api_key
```

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
