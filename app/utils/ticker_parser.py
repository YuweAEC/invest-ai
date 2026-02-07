import re
from typing import Optional, List


class TickerParser:
    """Utility class to extract stock ticker symbols from natural language queries."""
    
    # Common stock ticker patterns
    TICKER_PATTERN = re.compile(r'\b[A-Z]{1,5}\b')
    
    # Common company name to ticker mappings (can be extended)
    COMPANY_TICKERS = {
        'apple': 'AAPL',
        'microsoft': 'MSFT',
        'google': 'GOOGL',
        'alphabet': 'GOOGL',
        'amazon': 'AMZN',
        'tesla': 'TSLA',
        'meta': 'META',
        'facebook': 'META',
        'netflix': 'NFLX',
        'nvidia': 'NVDA',
        'bitcoin': 'BTC',
        'ethereum': 'ETH',
        'spdr': 'SPY',
        's&p': 'SPY',
        'nasdaq': 'QQQ'
    }
    
    @classmethod
    def extract_ticker(cls, query: str) -> Optional[str]:
        """
        Extract ticker symbol from user query.
        
        Args:
            query: User's natural language query
            
        Returns:
            Ticker symbol if found, None otherwise
        """
        query_lower = query.lower()
        
        # First check for company names in our mapping
        for company, ticker in cls.COMPANY_TICKERS.items():
            if company in query_lower:
                return ticker
        
        # Then look for ticker patterns (all caps, 1-5 letters)
        potential_tickers = cls.TICKER_PATTERN.findall(query)
        
        # Filter out common words that might match the pattern
        common_words = {'THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER', 'WAS', 'ONE', 'OUR', 'OUT', 'DAY', 'GET', 'HAS', 'HIM', 'HIS', 'HOW', 'ITS', 'MAY', 'NEW', 'NOW', 'OLD', 'SEE', 'TWO', 'WAY', 'WHO', 'BOY', 'DID', 'ITS', 'LET', 'PUT', 'SAY', 'SHE', 'TOO', 'USE'}
        
        valid_tickers = [ticker for ticker in potential_tickers if ticker not in common_words]
        
        if valid_tickers:
            # Return the first valid ticker found
            return valid_tickers[0]
        
        return None
    
    @classmethod
    def extract_multiple_tickers(cls, query: str) -> List[str]:
        """
        Extract multiple ticker symbols from user query.
        
        Args:
            query: User's natural language query
            
        Returns:
            List of ticker symbols found
        """
        tickers = set()
        query_lower = query.lower()
        
        # Check for company names
        for company, ticker in cls.COMPANY_TICKERS.items():
            if company in query_lower:
                tickers.add(ticker)
        
        # Check for ticker patterns
        potential_tickers = cls.TICKER_PATTERN.findall(query)
        common_words = {'THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER', 'WAS', 'ONE', 'OUR', 'OUT', 'DAY', 'GET', 'HAS', 'HIM', 'HIS', 'HOW', 'ITS', 'MAY', 'NEW', 'NOW', 'OLD', 'SEE', 'TWO', 'WAY', 'WHO', 'BOY', 'DID', 'ITS', 'LET', 'PUT', 'SAY', 'SHE', 'TOO', 'USE'}
        
        for ticker in potential_tickers:
            if ticker not in common_words:
                tickers.add(ticker)
        
        return list(tickers)
