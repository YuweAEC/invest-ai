"""
Simplified models file as specified in company requirements.
This imports all models from the modular structure.
"""

from app.models.chat import ChatSession, ChatMessage
from app.models.session import Session

# Export all models for convenience
__all__ = ['ChatSession', 'ChatMessage', 'Session']
