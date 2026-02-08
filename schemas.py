"""
Simplified schemas file as specified in company requirements.
This imports all schemas from the modular structure.
"""

from app.schemas.chat import (
    ChatRequest, 
    ChatResponse, 
    ChatSessionResponse, 
    StockData, 
    NewsItem, 
    SentimentResult
)
from app.schemas.query import QueryRequest, QueryResponse

# Export all schemas for convenience
__all__ = [
    'ChatRequest', 'ChatResponse', 'ChatSessionResponse', 
    'StockData', 'NewsItem', 'SentimentResult',
    'QueryRequest', 'QueryResponse'
]
