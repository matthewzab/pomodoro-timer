from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import engine, get_db, Base
from models import User
from auth_utils import create_user, verify_password, create_access_token, get_current_user

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Pomodoro Timer API")

@app.get("/")
def read_root():
    return {"message": "Pomodoro Timer API is running!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Get the registration data in JSON format
class UserAccount(BaseModel):
    email: str
    password: str

# Register user endpoint
@app.post("/register")
def register_user(user_data: UserAccount, db: Session = Depends(get_db)):
    try:
        user = create_user(db, user_data.email, user_data.password)
        return {"message": "User created successfulyy!", "user_id": user.id}
    except ValueError as e:
        raise HTTPException(status_code = 400, detail = str(e))

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

# Login endpoint
@app.post("/login")
def login(user_data: UserAccount, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if not existing_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    result = verify_password(user_data.password, existing_user.hashed_password)
    if result:
        token = create_access_token(existing_user.id)
        return {"access_token": token, "token_type": "bearer"}
    else:
        raise HTTPException(status_code=401, detail="Invalid email or password")

# Endpoint to retrive information about current user
@app.get("/me")
def get_my_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "total_pomodoros": current_user.total_pomodoros,
        "current_streak": current_user.current_streak,
        "created_at": current_user.created_at
    }
