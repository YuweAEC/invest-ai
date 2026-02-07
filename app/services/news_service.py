import requests
from typing import List, Optional
from datetime import datetime, timedelta
from app.core.config import settings
from app.core.logger import logger
from app.schemas.chat import NewsItem


class NewsService:
    """Service for fetching financial news using NewsAPI."""
    
    BASE_URL = "https://newsapi.org/v2"
    
    @classmethod
    def get_stock_news(cls, ticker: str, company_name: Optional[str] = None, limit: int = 5) -> List[NewsItem]:
        """
        Fetch recent news related to a stock ticker.
        
        Args:
            ticker: Stock ticker symbol
            company_name: Optional company name for broader search
            limit: Maximum number of articles to return
            
        Returns:
            List of NewsItem objects
        """
        if not settings.newsapi_key:
            logger.warning("NewsAPI key not configured. Returning empty news list.")
            return []
        
        try:
            # Search for both ticker and company name if provided
            search_queries = [ticker]
            if company_name:
                search_queries.append(company_name)
            
            all_articles = []
            
            for query in search_queries:
                params = {
                    'q': query,
                    'category': 'business',
                    'language': 'en',
                    'sortBy': 'publishedAt',
                    'pageSize': limit,
                    'apiKey': settings.newsapi_key
                }
                
                response = requests.get(f"{cls.BASE_URL}/everything", params=params, timeout=10)
                response.raise_for_status()
                
                data = response.json()
                
                if data.get('status') == 'ok' and data.get('articles'):
                    for article in data['articles'][:limit]:
                        news_item = NewsItem(
                            title=article.get('title', ''),
                            description=article.get('description', ''),
                            source=article.get('source', {}).get('name', 'Unknown'),
                            published_at=article.get('publishedAt', ''),
                            url=article.get('url', '')
                        )
                        all_articles.append(news_item)
            
            # Remove duplicates based on title
            seen_titles = set()
            unique_articles = []
            for article in all_articles:
                if article.title not in seen_titles:
                    seen_titles.add(article.title)
                    unique_articles.append(article)
            
            # Return the most recent articles
            return unique_articles[:limit]
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching news for {ticker}: {str(e)}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error in news service: {str(e)}")
            return []
    
    @classmethod
    def get_market_news(cls, limit: int = 10) -> List[NewsItem]:
        """
        Fetch general market news.
        
        Args:
            limit: Maximum number of articles to return
            
        Returns:
            List of NewsItem objects
        """
        if not settings.newsapi_key:
            logger.warning("NewsAPI key not configured. Returning empty news list.")
            return []
        
        try:
            params = {
                'country': 'us',
                'category': 'business',
                'pageSize': limit,
                'apiKey': settings.newsapi_key
            }
            
            response = requests.get(f"{cls.BASE_URL}/top-headlines", params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            articles = []
            if data.get('status') == 'ok' and data.get('articles'):
                for article in data['articles']:
                    news_item = NewsItem(
                        title=article.get('title', ''),
                        description=article.get('description', ''),
                        source=article.get('source', {}).get('name', 'Unknown'),
                        published_at=article.get('publishedAt', ''),
                        url=article.get('url', '')
                    )
                    articles.append(news_item)
            
            return articles
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching market news: {str(e)}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error in news service: {str(e)}")
            return []
