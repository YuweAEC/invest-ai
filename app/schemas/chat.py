from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ChatRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=500, description="User's investment query")
    session_id: Optional[str] = Field(None, description="Session ID for conversation continuity")


class StockData(BaseModel):
    symbol: str
    current_price: float
    change_percent: float
    volume: Optional[int] = None
    market_cap: Optional[float] = None


class NewsItem(BaseModel):
    title: str
    description: Optional[str] = None
    source: str
    published_at: str
    url: str


class SentimentResult(BaseModel):
    sentiment: str  # "Positive", "Neutral", "Negative"
    confidence: float
    polarity: float


class ChatResponse(BaseModel):
    query: str
    detected_ticker: Optional[str] = None
    stock_data: Optional[StockData] = None
    sentiment_result: Optional[SentimentResult] = None
    ai_summary: str
    relevant_news: List[NewsItem] = []
    timestamp: datetime
    session_id: str


class ChatMessageResponse(BaseModel):
    id: int
    user_query: str
    ai_response: str
    ticker_symbol: Optional[str] = None
    sentiment_result: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ChatSessionResponse(BaseModel):
    session_id: str
    created_at: datetime
    updated_at: datetime
    messages: List[ChatMessageResponse] = []

    class Config:
        from_attributes = True


class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    version: str
    services: dict
