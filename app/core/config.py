import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "InvestAI"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # Database
    database_url: str = "sqlite:///./investai.db"
    
    # API Keys
    newsapi_key: Optional[str] = None
    
    # AI Model Settings
    huggingface_model: str = "gpt2"
    max_tokens: int = 150
    temperature: float = 0.7
    
    # Environment Settings
    tf_enable_onednn_opts: Optional[str] = None
    
    # API Settings
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
