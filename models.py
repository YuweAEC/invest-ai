"""
Simplified models file as specified in company requirements.
This imports all models from modular structure.
"""

from app.models.chat import ChatSession, ChatMessage

# Export all models for convenience
__all__ = ['ChatSession', 'ChatMessage']
