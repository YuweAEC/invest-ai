from transformers import pipeline, GPT2LMHeadModel, GPT2Tokenizer
from typing import List, Dict, Optional
import torch
from app.core.config import settings
from app.core.logger import logger
from app.schemas.chat import StockData, NewsItem, SentimentResult


class AIEngine:
    """Service for generating AI-powered investment summaries using GPT-2."""
    
    _instance = None
    _initialized = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AIEngine, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not AIEngine._initialized:
            self.generator = None
            self.model_name = settings.huggingface_model
            self.max_tokens = settings.max_tokens
            self.temperature = settings.temperature
            self._initialize_model()
            AIEngine._initialized = True
    
    def _initialize_model(self):
        """Initialize GPT-2 model and tokenizer."""
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
        """Generate an AI-powered investment summary."""
        
        # Always try to generate a response, even if AI model fails
        try:
            if self.generator:
                logger.info("Attempting AI generation...")
                prompt = self._build_prompt(query, ticker, stock_data, news_items, sentiment_result)
                
                # Generate text
                generated_texts = self.generator(prompt, max_new_tokens=100, pad_token_id=self.tokenizer.eos_token_id)
                
                if generated_texts and len(generated_texts) > 0:
                    generated_text = generated_texts[0]['generated_text']
                    
                    # Remove the prompt from the generated text
                    if generated_text.startswith(prompt):
                        summary = generated_text[len(prompt):].strip()
                    else:
                        summary = generated_text.strip()
                    
                    # Clean up the summary
                    summary = self._clean_summary(summary)
                    
                    # Ensure we have a meaningful response
                    if len(summary) > 20:  # At least 20 characters
                        logger.info(f"Successfully generated AI summary: {len(summary)} characters")
                        return summary
                    else:
                        logger.warning("AI generated too short response, using fallback")
                        return self._generate_fallback_summary(query, ticker, stock_data, news_items, sentiment_result)
                else:
                    logger.warning("AI model returned no text, using fallback")
                    return self._generate_fallback_summary(query, ticker, stock_data, news_items, sentiment_result)
            else:
                logger.info("AI model not available, using fallback")
                return self._generate_fallback_summary(query, ticker, stock_data, news_items, sentiment_result)
                
        except Exception as e:
            logger.error(f"Error in AI generation: {str(e)}")
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
        
        # Handle general queries without specific stocks
        if not ticker:
            if "hello" in query.lower() or "hi" in query.lower():
                return "Hello! I'm InvestAI, your AI-powered investment research assistant. Ask me about any stock or investment topic, and I'll provide you with real-time data, news analysis, and AI insights. For example, try asking 'How is Apple stock doing today?' or 'Tell me about Tesla's recent performance.'"
            else:
                return f"I understand you're asking about: '{query}'. To provide you with detailed investment analysis, please mention a specific stock ticker (like AAPL, TSLA, MSFT) or company name. I can then give you real-time prices, recent news, sentiment analysis, and AI-powered insights."
        
        # Handle queries with tickers
        if ticker:
            if stock_data:
                change_str = "up" if stock_data.change_percent > 0 else "down"
                summary_parts.append(
                    f"{ticker} is currently trading at ${stock_data.current_price}, "
                    f"{change_str} {abs(stock_data.change_percent)}%."
                )
            else:
                summary_parts.append(f"I found the ticker {ticker} in your query, but I'm unable to fetch current market data at the moment. This could be due to market hours or data availability.")
        
        if news_items and len(news_items) > 0:
            summary_parts.append(f"Recent news includes {len(news_items)} relevant articles.")
            if news_items:
                summary_parts.append(f"Latest headline: {news_items[0].title}")
        
        if sentiment_result:
            summary_parts.append(
                f"Market sentiment appears {sentiment_result.sentiment.lower()} "
                f"with {sentiment_result.confidence:.1%} confidence."
            )
        
        # If we still don't have meaningful content, provide a helpful response
        if not summary_parts or len(" ".join(summary_parts)) < 30:
            if ticker:
                summary_parts.append(f"For detailed analysis of {ticker}, please try again later or check if the market is currently open. I can provide real-time data, news sentiment, and AI-powered investment insights when market data is available.")
            else:
                summary_parts.append("I'm here to help with investment research. Please ask about specific stocks or investment topics, and I'll provide detailed analysis with real-time data.")
        
        return " ".join(summary_parts)
