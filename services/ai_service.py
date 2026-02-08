"""
AI Service wrapper as specified in company requirements.
This provides a simplified interface to the AI engine.
"""

from app.services.ai_engine import AIEngine

class AIService:
    """Simplified AI service interface."""
    
    def __init__(self):
        self.engine = AIEngine()
    
    def generate_response(self, query, ticker=None, stock_data=None, news=None, sentiment=None):
        """Generate AI response for investment query."""
        return self.engine.generate_investment_summary(
            query=query,
            ticker=ticker,
            stock_data=stock_data,
            news_items=news,
            sentiment_result=sentiment
        )

# Create singleton instance
ai_service = AIService()
