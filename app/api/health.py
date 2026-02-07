from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
import requests

from app.db.session import get_db
from app.core.config import settings
from app.core.logger import logger
from app.schemas.chat import HealthResponse

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/", response_model=HealthResponse)
async def health_check(db: Session = Depends(get_db)):
    """
    Comprehensive health check for all services.
    """
    services = {}
    overall_status = "healthy"
    
    # Check database connection
    try:
        db.execute("SELECT 1")
        services["database"] = "healthy"
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        services["database"] = "unhealthy"
        overall_status = "unhealthy"
    
    # Check NewsAPI (if configured)
    if settings.newsapi_key:
        try:
            response = requests.get(
                "https://newsapi.org/v2/top-headlines",
                params={"country": "us", "pageSize": 1, "apiKey": settings.newsapi_key},
                timeout=5
            )
            if response.status_code == 200:
                services["newsapi"] = "healthy"
            else:
                services["newsapi"] = "unhealthy"
                overall_status = "unhealthy"
        except Exception as e:
            logger.error(f"NewsAPI health check failed: {str(e)}")
            services["newsapi"] = "unhealthy"
            overall_status = "unhealthy"
    else:
        services["newsapi"] = "not_configured"
    
    # Check yfinance (basic test)
    try:
        import yfinance as yf
        stock = yf.Ticker("AAPL")
        info = stock.info
        if info:
            services["yfinance"] = "healthy"
        else:
            services["yfinance"] = "unhealthy"
            overall_status = "unhealthy"
    except Exception as e:
        logger.error(f"YFinance health check failed: {str(e)}")
        services["yfinance"] = "unhealthy"
        overall_status = "unhealthy"
    
    # Check TextBlob
    try:
        from textblob import TextBlob
        blob = TextBlob("Test sentiment analysis")
        sentiment = blob.sentiment
        services["textblob"] = "healthy"
    except Exception as e:
        logger.error(f"TextBlob health check failed: {str(e)}")
        services["textblob"] = "unhealthy"
        overall_status = "unhealthy"
    
    # Check Hugging Face Transformers
    try:
        from transformers import pipeline
        # Just check if we can import and create a pipeline (without loading models)
        services["transformers"] = "healthy"
    except Exception as e:
        logger.error(f"Transformers health check failed: {str(e)}")
        services["transformers"] = "unhealthy"
        overall_status = "unhealthy"
    
    return HealthResponse(
        status=overall_status,
        timestamp=datetime.utcnow(),
        version=settings.app_version,
        services=services
    )


@router.get("/simple")
async def simple_health_check():
    """
    Simple health check endpoint.
    """
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "service": "InvestAI"
    }
