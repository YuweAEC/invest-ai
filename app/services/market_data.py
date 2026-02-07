import yfinance as yf
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from app.core.logger import logger
from app.schemas.chat import StockData


class MarketDataService:
    """Service for fetching real-time and historical market data."""
    
    @staticmethod
    def get_stock_data(ticker: str) -> Optional[StockData]:
        """
        Fetch current stock data for a given ticker.
        
        Args:
            ticker: Stock ticker symbol
            
        Returns:
            StockData object with current price and change information
        """
        try:
            stock = yf.Ticker(ticker.upper())
            
            # Get current day's data
            hist = stock.history(period="2d")
            
            if hist.empty:
                logger.warning(f"No data found for ticker: {ticker}")
                return None
            
            # Get the most recent data
            latest = hist.iloc[-1]
            previous = hist.iloc[-2] if len(hist) > 1 else latest
            
            current_price = latest['Close']
            previous_close = previous['Close']
            
            # Calculate percentage change
            change_percent = ((current_price - previous_close) / previous_close) * 100
            
            # Get additional info
            info = stock.info
            
            stock_data = StockData(
                symbol=ticker.upper(),
                current_price=round(current_price, 2),
                change_percent=round(change_percent, 2),
                volume=int(latest['Volume']) if 'Volume' in latest else None,
                market_cap=info.get('marketCap') if info else None
            )
            
            logger.info(f"Successfully fetched data for {ticker}: {stock_data.current_price}")
            return stock_data
            
        except Exception as e:
            logger.error(f"Error fetching market data for {ticker}: {str(e)}")
            return None
    
    @staticmethod
    def get_historical_data(ticker: str, period: str = "1mo") -> Optional[Dict[str, Any]]:
        """
        Fetch historical stock data.
        
        Args:
            ticker: Stock ticker symbol
            period: Time period (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)
            
        Returns:
            Dictionary with historical data
        """
        try:
            stock = yf.Ticker(ticker.upper())
            hist = stock.history(period=period)
            
            if hist.empty:
                return None
            
            # Convert to dictionary for easier processing
            data = {
                'dates': hist.index.strftime('%Y-%m-%d').tolist(),
                'prices': hist['Close'].tolist(),
                'volumes': hist['Volume'].tolist(),
                'highs': hist['High'].tolist(),
                'lows': hist['Low'].tolist()
            }
            
            return data
            
        except Exception as e:
            logger.error(f"Error fetching historical data for {ticker}: {str(e)}")
            return None
    
    @staticmethod
    def validate_ticker(ticker: str) -> bool:
        """
        Validate if a ticker symbol exists.
        
        Args:
            ticker: Stock ticker symbol
            
        Returns:
            True if ticker is valid, False otherwise
        """
        try:
            stock = yf.Ticker(ticker.upper())
            info = stock.info
            
            # Check if we got valid data
            return bool(info and 'regularMarketPrice' in info)
            
        except Exception:
            return False
