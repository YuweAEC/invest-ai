"""
Data Service wrapper as specified in company requirements.
This provides a simplified interface to market data and news services.
"""

from app.services.market_data import MarketDataService
from app.services.news_service import NewsService

class DataService:
    """Simplified data service interface."""
    
    def get_stock_data(self, ticker):
        """Get stock data for ticker."""
        return MarketDataService.get_stock_data(ticker)
    
    def get_news(self, ticker, limit=5):
        """Get news for ticker."""
        return NewsService.get_stock_news(ticker, limit=limit)

# Create singleton instance
data_service = DataService()
