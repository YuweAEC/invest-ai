"""
Analysis Service wrapper as specified in company requirements.
This provides a simplified interface to sentiment analysis.
"""

from app.services.sentiment import SentimentService

class AnalysisService:
    """Simplified analysis service interface."""
    
    def analyze_sentiment(self, news_texts):
        """Analyze sentiment from news texts."""
        return SentimentService.analyze_news_sentiment(news_texts)
    
    def get_sentiment_summary(self, analysis_result):
        """Get human-readable sentiment summary."""
        return SentimentService.get_sentiment_summary(analysis_result)

# Create singleton instance
analysis_service = AnalysisService()
