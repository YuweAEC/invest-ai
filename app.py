"""
InvestAI Main Application Entry Point
Simplified entry point as specified in company requirements.
"""

from app.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
