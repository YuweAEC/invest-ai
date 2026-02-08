from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class QueryRequest(BaseModel):
    """Request model matching company specification."""
    user_id: int = Field(..., description="User ID for tracking")
    query: str = Field(..., min_length=1, max_length=500, description="User's investment query")
    session_id: Optional[str] = Field(None, description="Session ID for conversation continuity")


class QueryResponse(BaseModel):
    """Response model matching company specification."""
    response: str = Field(..., description="AI-generated investment analysis")
    sources: List[str] = Field(..., description="Data sources used")
    user_id: int = Field(..., description="User ID from request")
    timestamp: datetime = Field(..., description="Response timestamp")


# Sample response format as specified by company
SAMPLE_RESPONSE = {
    "response": "Apple Inc. (AAPL) is trading at $175.20, up 2.1% today. Over the past month, it gained 8.4%. Recent news shows positive sentiment around iPhone sales and AI initiatives. Overall news sentiment: Positive",
    "sources": ["Yahoo Finance", "NewsAPI"]
}
