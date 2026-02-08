from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
from datetime import datetime

from app.db.session import get_db
from app.models.chat import ChatSession, ChatMessage
from app.schemas.query import QueryRequest, QueryResponse
from app.utils.ticker_parser import TickerParser
from app.services.market_data import MarketDataService
from app.services.news_service import NewsService
from app.services.sentiment import SentimentService
from app.services.ai_engine import AIEngine
from app.core.logger import logger

router = APIRouter(prefix="/query", tags=["query"])

# Initialize AI Engine
ai_engine = AIEngine()


@router.post("/", response_model=QueryResponse)
async def query(request: QueryRequest, db: Session = Depends(get_db)):
    """
    Process a query message and return AI-powered investment analysis.
    Matches company specification exactly.
    """
    try:
        # Generate or use existing session ID
        session_id = request.session_id or str(uuid.uuid4())
        
        # Extract ticker from query
        detected_ticker = TickerParser.extract_ticker(request.query)
        
        # Initialize variables
        stock_data = None
        relevant_news = []
        sentiment_result = None
        ai_summary = ""
        
        # Fetch stock data if ticker detected
        if detected_ticker:
            stock_data = MarketDataService.get_stock_data(detected_ticker)
            
            # Fetch news if we have valid stock data
            if stock_data:
                relevant_news = NewsService.get_stock_news(detected_ticker, limit=3)
                
                # Perform sentiment analysis on news
                if relevant_news:
                    news_texts = [f"{news.title} {news.description or ''}" for news in relevant_news]
                    sentiment_analysis = SentimentService.analyze_news_sentiment(news_texts)
                    sentiment_result = {
                        "sentiment": sentiment_analysis["overall_sentiment"],
                        "confidence": abs(sentiment_analysis["average_polarity"]),
                        "polarity": sentiment_analysis["average_polarity"]
                    }
        
        # Generate AI summary
        ai_summary = ai_engine.generate_investment_summary(
            query=request.query,
            ticker=detected_ticker,
            stock_data=stock_data,
            news_items=relevant_news,
            sentiment_result=sentiment_result
        )
        
        # Store conversation in database
        _store_conversation(
            db=db,
            session_id=session_id,
            user_query=request.query,
            ai_response=ai_summary,
            ticker_symbol=detected_ticker,
            sentiment_result=sentiment_result["sentiment"] if sentiment_result else None
        )
        
        # Create response matching company format
        response = QueryResponse(
            response=ai_summary,
            sources=["Yahoo Finance", "NewsAPI"],
            user_id=request.user_id,
            timestamp=datetime.utcnow()
        )
        
        logger.info(f"Processed query for user {request.user_id}, ticker: {detected_ticker}")
        return response
        
    except Exception as e:
        logger.error(f"Error processing query: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


def _store_conversation(
    db: Session,
    session_id: str,
    user_query: str,
    ai_response: str,
    ticker_symbol: str = None,
    sentiment_result: str = None
):
    """Store conversation in database."""
    try:
        # Get or create session
        session = db.query(ChatSession).filter(ChatSession.session_id == session_id).first()
        if not session:
            session = ChatSession(session_id=session_id)
            db.add(session)
            db.flush()  # Get the ID without committing
        
        # Create message
        message = ChatMessage(
            session_id=session_id,
            user_query=user_query,
            ai_response=ai_response,
            ticker_symbol=ticker_symbol,
            sentiment_result=sentiment_result
        )
        
        db.add(message)
        
        # Update session timestamp
        session.updated_at = datetime.utcnow()
        
        db.commit()
        
    except Exception as e:
        logger.error(f"Error storing conversation: {str(e)}")
        db.rollback()
        raise
