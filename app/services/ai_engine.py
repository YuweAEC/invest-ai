from transformers import pipeline, GPT2LMHeadModel, GPT2Tokenizer
from typing import List, Dict, Optional
import torch
from app.core.config import settings
from app.core.logger import logger
from app.schemas.chat import StockData, NewsItem, SentimentResult


class AIEngine:
    """Service for generating AI-powered investment summaries using GPT-2."""
    
    def __init__(self):
        self.generator = None
        self.model_name = settings.huggingface_model
        self.max_tokens = settings.max_tokens
        self.temperature = settings.temperature
        self._initialize_model()
    
    def _initialize_model(self):
        """Initialize the GPT-2 model and tokenizer."""
        try:
            logger.info(f"Loading GPT-2 model: {self.model_name}")
            
            # Load tokenizer and model
            self.tokenizer = GPT2Tokenizer.from_pretrained(self.model_name)
            self.model = GPT2LMHeadModel.from_pretrained(self.model_name)
            
            # Set padding token
            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token
            
            # Create text generation pipeline
            self.generator = pipeline(
                "text-generation",
                model=self.model,
                tokenizer=self.tokenizer,
                max_length=self.max_tokens,
                temperature=self.temperature,
                num_return_sequences=1,
                pad_token_id=self.tokenizer.eos_token_id,
                do_sample=True,
                top_p=0.92,
                top_k=50
            )
            
            logger.info("GPT-2 model loaded successfully")
            
        except Exception as e:
            logger.error(f"Error loading GPT-2 model: {str(e)}")
            self.generator = None
    
    def generate_investment_summary(
        self,
        query: str,
        ticker: Optional[str],
        stock_data: Optional[StockData],
        news_items: List[NewsItem],
        sentiment_result: Optional[SentimentResult]
    ) -> str:
        """
        Generate an AI-powered investment summary.
        
        Args:
            query: Original user query
            ticker: Detected ticker symbol
            stock_data: Stock market data
            news_items: Relevant news articles
            sentiment_result: Sentiment analysis result
            
        Returns:
            AI-generated investment summary
        """
        if not self.generator:
            return self._generate_fallback_summary(query, ticker, stock_data, news_items, sentiment_result)
        
        try:
            # Build context prompt
            prompt = self._build_prompt(query, ticker, stock_data, news_items, sentiment_result)
            
            # Generate response
            generated_texts = self.generator(prompt)
            
            if generated_texts and len(generated_texts) > 0:
                generated_text = generated_texts[0]['generated_text']
                
                # Extract only the generated part (remove the prompt)
                if generated_text.startswith(prompt):
                    summary = generated_text[len(prompt):].strip()
                else:
                    summary = generated_text.strip()
                
                # Clean up the summary
                summary = self._clean_summary(summary)
                
                logger.info(f"Generated AI summary for {ticker}: {len(summary)} characters")
                return summary
            else:
                logger.warning("No text generated from AI model")
                return self._generate_fallback_summary(query, ticker, stock_data, news_items, sentiment_result)
                
        except Exception as e:
            logger.error(f"Error generating AI summary: {str(e)}")
            return self._generate_fallback_summary(query, ticker, stock_data, news_items, sentiment_result)
    
    def _build_prompt(
        self,
        query: str,
        ticker: Optional[str],
        stock_data: Optional[StockData],
        news_items: List[NewsItem],
        sentiment_result: Optional[SentimentResult]
    ) -> str:
        """Build a comprehensive prompt for the AI model."""
        
        prompt = f"As an investment analyst, provide a concise summary for the following query: '{query}'.\\n\\n"
        
        if ticker:
            prompt += f"Stock: {ticker}\\n"
            
            if stock_data:
                prompt += f"Current Price: ${stock_data.current_price}\\n"
                prompt += f"Change: {stock_data.change_percent}%\\n"
                if stock_data.volume:
                    prompt += f"Volume: {stock_data.volume:,}\\n"
        
        if news_items:
            prompt += f"\\nRecent News ({len(news_items)} articles):\\n"
            for i, news in enumerate(news_items[:3]):  # Limit to top 3 news items
                prompt += f"{i+1}. {news.title}\\n"
                if news.description:
                    prompt += f"   {news.description[:100]}...\\n"
        
        if sentiment_result:
            prompt += f"\\nSentiment Analysis: {sentiment_result.sentiment} (confidence: {sentiment_result.confidence})\\n"
        
        prompt += "\\nInvestment Summary:\\n"
        
        return prompt
    
    def _clean_summary(self, summary: str) -> str:
        """Clean and format the generated summary."""
        # Remove incomplete sentences
        if not summary.endswith(('.', '!', '?')):
            last_period = summary.rfind('.')
            if last_period > 0:
                summary = summary[:last_period + 1]
        
        # Remove any repeated phrases or artifacts
        lines = summary.split('\\n')
        cleaned_lines = []
        for line in lines:
            line = line.strip()
            if line and len(line) > 10:  # Filter out very short lines
                cleaned_lines.append(line)
        
        return ' '.join(cleaned_lines)
    
    def _generate_fallback_summary(
        self,
        query: str,
        ticker: Optional[str],
        stock_data: Optional[StockData],
        news_items: List[NewsItem],
        sentiment_result: Optional[SentimentResult]
    ) -> str:
        """Generate a fallback summary when AI model is unavailable."""
        
        summary_parts = []
        
        if ticker and stock_data:
            change_str = "up" if stock_data.change_percent > 0 else "down"
            summary_parts.append(
                f"{ticker} is currently trading at ${stock_data.current_price}, "
                f"{change_str} {abs(stock_data.change_percent)}%."
            )
        
        if news_items:
            summary_parts.append(f"Recent news includes {len(news_items)} relevant articles.")
            if news_items:
                summary_parts.append(f"Latest headline: {news_items[0].title}")
        
        if sentiment_result:
            summary_parts.append(
                f"Market sentiment appears {sentiment_result.sentiment.lower()} "
                f"with {sentiment_result.confidence:.1%} confidence."
            )
        
        if not summary_parts:
            summary_parts.append("Unable to generate detailed analysis at this time.")
        
        return " ".join(summary_parts)
