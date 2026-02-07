from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
from datetime import datetime

from app.db.session import get_db
from app.models.chat import ChatSession, ChatMessage
from app.schemas.chat import ChatRequest, ChatResponse, ChatSessionResponse
from app.utils.ticker_parser import TickerParser
from app.services.market_data import MarketDataService
from app.services.news_service import NewsService
from app.services.sentiment import SentimentService
from app.services.ai_engine import AIEngine
from app.core.logger import logger

router = APIRouter(prefix="/chat", tags=["chat"])

# Initialize AI Engine
ai_engine = AIEngine()


@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Process a chat message and return AI-powered investment analysis.
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
        
        # Create response
        response = ChatResponse(
            query=request.query,
            detected_ticker=detected_ticker,
            stock_data=stock_data,
            sentiment_result=sentiment_result,
            ai_summary=ai_summary,
            relevant_news=relevant_news,
            timestamp=datetime.utcnow(),
            session_id=session_id
        )
        
        logger.info(f"Processed chat request for session {session_id}, ticker: {detected_ticker}")
        return response
        
    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/sessions/{session_id}", response_model=ChatSessionResponse)
async def get_session_history(session_id: str, db: Session = Depends(get_db)):
    """
    Retrieve chat history for a specific session.
    """
    try:
        # Get session
        session = db.query(ChatSession).filter(ChatSession.session_id == session_id).first()
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Get messages for the session
        messages = db.query(ChatMessage).filter(
            ChatMessage.session_id == session_id
        ).order_by(ChatMessage.created_at).all()
        
        return ChatSessionResponse(
            session_id=session.session_id,
            created_at=session.created_at,
            updated_at=session.updated_at,
            messages=messages
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving session history: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/sessions/", response_model=List[ChatSessionResponse])
async def get_all_sessions(db: Session = Depends(get_db)):
    """
    Retrieve all chat sessions.
    """
    try:
        sessions = db.query(ChatSession).order_by(ChatSession.updated_at.desc()).all()
        
        result = []
        for session in sessions:
            messages = db.query(ChatMessage).filter(
                ChatMessage.session_id == session.session_id
            ).order_by(ChatMessage.created_at).all()
            
            result.append(ChatSessionResponse(
                session_id=session.session_id,
                created_at=session.created_at,
                updated_at=session.updated_at,
                messages=messages
            ))
        
        return result
        
    except Exception as e:
        logger.error(f"Error retrieving all sessions: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str, db: Session = Depends(get_db)):
    """
    Delete a chat session and all its messages.
    """
    try:
        session = db.query(ChatSession).filter(ChatSession.session_id == session_id).first()
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Delete session (cascade will delete messages)
        db.delete(session)
        db.commit()
        
        logger.info(f"Deleted session {session_id}")
        return {"message": "Session deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting session: {str(e)}")
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
