from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import engine, get_db, Base
from models import User

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Pomodoro Timer API")

@app.get("/")
def read_root():
    return {"message": "Pomodoro Timer API is running!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Test endpoint to create a user
@app.post("/test-user")
def create_test_user(db: Session = Depends(get_db)):
    # Check if test user already exists
    existing_user = db.query(User).filter(User.email == "test@example.com").first()
    if existing_user:
        return {"message": "Test user already exists", "user_id": existing_user.id}
    
    # Create new test user
    test_user = User(
        email="test@example.com",
        hashed_password="fake_hashed_password",  # Implement real hashing later
        total_pomodoros=5,
        current_streak=2
    )
    db.add(test_user)
    db.commit()
    db.refresh(test_user)
    
    return {"message": "Test user created!", "user_id": test_user.id}

# Test endpoint to get user data
@app.get("/user/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": user.id,
        "email": user.email,
        "total_pomodoros": user.total_pomodoros,
        "current_streak": user.current_streak,
        "created_at": user.created_at
    }