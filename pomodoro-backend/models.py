from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)
    
    # Pomodoro stats
    total_pomodoros = Column(Integer, default=0)
    current_streak = Column(Integer, default=0)
    last_completion_date = Column(String, nullable=True)
    last_daily_challenge_date = Column(String, nullable=True)

    # Sync tracking
    last_sync = Column(DateTime(timezone=True), nullable=True)