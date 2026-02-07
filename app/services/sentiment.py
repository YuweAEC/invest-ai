from textblob import TextBlob
from typing import List, Dict
from app.core.logger import logger
from app.schemas.chat import SentimentResult


class SentimentService:
    """Service for analyzing sentiment of financial news and text."""
    
    @staticmethod
    def analyze_sentiment(text: str) -> SentimentResult:
        """
        Analyze sentiment of a given text.
        
        Args:
            text: Text to analyze
            
        Returns:
            SentimentResult object with sentiment classification and confidence
        """
        try:
            blob = TextBlob(text)
            polarity = blob.sentiment.polarity
            
            # Classify sentiment based on polarity
            if polarity > 0.1:
                sentiment = "Positive"
            elif polarity < -0.1:
                sentiment = "Negative"
            else:
                sentiment = "Neutral"
            
            # Calculate confidence (absolute polarity as confidence score)
            confidence = abs(polarity)
            
            result = SentimentResult(
                sentiment=sentiment,
                confidence=round(confidence, 3),
                polarity=round(polarity, 3)
            )
            
            logger.debug(f"Sentiment analysis: '{text[:50]}...' -> {sentiment} ({polarity:.3f})")
            return result
            
        except Exception as e:
            logger.error(f"Error analyzing sentiment: {str(e)}")
            # Return neutral sentiment on error
            return SentimentResult(
                sentiment="Neutral",
                confidence=0.0,
                polarity=0.0
            )
    
    @staticmethod
    def analyze_news_sentiment(news_items: List[str]) -> Dict[str, any]:
        """
        Analyze sentiment across multiple news items.
        
        Args:
            news_items: List of news text items
            
        Returns:
            Dictionary with overall sentiment analysis
        """
        if not news_items:
            return {
                "overall_sentiment": "Neutral",
                "average_polarity": 0.0,
                "positive_count": 0,
                "negative_count": 0,
                "neutral_count": 0,
                "total_articles": 0
            }
        
        polarities = []
        positive_count = 0
        negative_count = 0
        neutral_count = 0
        
        for text in news_items:
            if not text.strip():
                continue
                
            result = SentimentService.analyze_sentiment(text)
            polarities.append(result.polarity)
            
            if result.sentiment == "Positive":
                positive_count += 1
            elif result.sentiment == "Negative":
                negative_count += 1
            else:
                neutral_count += 1
        
        # Calculate overall sentiment
        avg_polarity = sum(polarities) / len(polarities) if polarities else 0.0
        
        if avg_polarity > 0.05:
            overall_sentiment = "Positive"
        elif avg_polarity < -0.05:
            overall_sentiment = "Negative"
        else:
            overall_sentiment = "Neutral"
        
        return {
            "overall_sentiment": overall_sentiment,
            "average_polarity": round(avg_polarity, 3),
            "positive_count": positive_count,
            "negative_count": negative_count,
            "neutral_count": neutral_count,
            "total_articles": len(news_items)
        }
    
    @staticmethod
    def get_sentiment_summary(analysis_result: Dict[str, any]) -> str:
        """
        Generate a human-readable summary of sentiment analysis.
        
        Args:
            analysis_result: Result from analyze_news_sentiment
            
        Returns:
            Human-readable sentiment summary
        """
        total = analysis_result["total_articles"]
        if total == 0:
            return "No news available for sentiment analysis."
        
        overall = analysis_result["overall_sentiment"]
        avg_polarity = analysis_result["average_polarity"]
        
        summary = f"Sentiment analysis of {total} news articles shows {overall.lower()} sentiment "
        summary += f"(average polarity: {avg_polarity:.3f}). "
        
        if analysis_result["positive_count"] > 0:
            summary += f"{analysis_result['positive_count']} positive articles. "
        if analysis_result["negative_count"] > 0:
            summary += f"{analysis_result['negative_count']} negative articles. "
        if analysis_result["neutral_count"] > 0:
            summary += f"{analysis_result['neutral_count']} neutral articles."
        
        return summary.strip()
