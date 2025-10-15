from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime, timezone
from database import engine, get_db, Base
from models import User
from auth_utils import create_user, verify_password, create_access_token, get_current_user

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Pomodoro Timer API")

# Prevents multiple origin errors
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"]
)

# Pydantic models
class UserAccount(BaseModel):
    email: str
    password: str

class PomodoroCompletion(BaseModel):
    pomos_earned: int
    current_streak: int
    last_completion_date: str | None = None
    last_daily_challenge_date: str | None = None

class SyncSession(BaseModel):
    pomos_to_add: int
    current_streak: int
    last_completion_date: str | None = None
    last_daily_challenge_date: str | None = None

class SyncData(BaseModel):
    total_pomodoros: int
    current_streak: int
    last_completion_date: str | None = None
    last_daily_challenge_date: str | None = None

# Endpoints

# --- Health/Info endpoints --- 
@app.get("/")
def read_root():
    return {"message": "Pomodoro Timer API is running!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# --- Authentication endpoints ---
@app.post("/register")
def register_user(
    user_data: UserAccount,
    db: Session = Depends(get_db)
):
    """
    Registers a new user into the database.
    Called when a user creates an account.
    """
    try:
        user = create_user(db, user_data.email, user_data.password)
        return {"message": "User created successfulyy!", "user_id": user.id}
    except ValueError as e:
        raise HTTPException(status_code = 400, detail = str(e))

@app.post("/login")
def login(
    user_data: UserAccount,
    db: Session = Depends(get_db)
):
    """
    Login into an existing user account.
    Creates a token for the user to use during their session.
    Called when a user logins into there account.
    """
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if not existing_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    result = verify_password(user_data.password, existing_user.hashed_password)
    if result:
        token = create_access_token(existing_user.id)
        return {"access_token": token, "token_type": "bearer"}
    else:
        raise HTTPException(status_code=401, detail="Invalid email or password")

# --- User endpoints ---
@app.get("/user/{user_id}")
def get_user(
    user_id: int, 
    db: Session = Depends(get_db)
):
    """
    Find any user within the database and reveal their stats using their user_id.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": user.id,
        "email": user.email,
        "created_at": user.created_at,
        "total_pomodoros": user.total_pomodoros,
        "current_streak": user.current_streak,
        "last_completion_date": user.last_completion_date,
        "last_daily_challenge_date": user.last_daily_challenge_date
    }

@app.get("/stats")
def get_stats(
    user: User = Depends(get_current_user)
):
    """
    Get the authenticated user's pomodoro statistics.
    Called when the app opens to load their data after logging in.
    """
    return {
        "id": user.id,
        "email": user.email,
        "total_pomodoros": user.total_pomodoros,
        "current_streak": user.current_streak,
        "last_completion_date": user.last_completion_date,
        "last_daily_challenge_date": user.last_daily_challenge_date
    }

# --- Pomodoro/sync endpoints ---
@app.post("/pomodoro/complete")
def complete_pomodoro(
    completion: PomodoroCompletion,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Records a completed pomodoro for the authenticated user.
    Updates total_pomodoros, current_streak, last_completion_date, last_daily_challenge_date.
    """
    user.total_pomodoros += completion.pomos_earned
    user.current_streak = completion.current_streak
    user.last_completion_date = completion.last_completion_date
    user.last_daily_challenge_date = completion.last_daily_challenge_date
    
    db.add(user)
    db.commit()
    db.refresh(user)

    return {"success": True,
            "total_pomodoros": user.total_pomodoros,
            "current_streak": user.current_streak,
            "last_completion_date": user.last_completion_date,
            "last_daily_challenge": user.last_daily_challenge_date}

@app.post("/sync-session")
def sync_session(
    session_data: SyncSession,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Syncs guest session data when user registers.
    Adds guest stats to their new account.
    """
    user.total_pomodoros += session_data.pomos_to_add
    user.current_streak = session_data.current_streak
    user.last_completion_date = session_data.last_completion_date
    user.last_daily_challenge_date = session_data.last_daily_challenge_date

    db.add(user)
    db.commit()
    db.refresh(user)

    return {"success": True,
            "total_pomodoros": user.total_pomodoros,
            "current_streak": user.current_streak,
            "last_completion_date": user.last_completion_date,
            "last_daily_challenge": user.last_daily_challenge_date}

@app.put("/sync")
def sync_stats(
    sync_data: SyncData,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Background sync endpoint. Updates user stats if frontend data is newer.
    Prevents data loss by only accepting updates where total_pomodoros >= current.
    """
    if(sync_data.total_pomodoros < user.total_pomodoros):
        raise HTTPException(status_code=400, detail="Sync Rejected. Possible data loss detected.")
    
    user.total_pomodoros = sync_data.total_pomodoros
    user.current_streak = sync_data.current_streak
    user.last_completion_date = sync_data.last_completion_date
    user.last_daily_challenge_date = sync_data.last_daily_challenge_date
    user.last_sync = datetime.now(timezone.utc)

    db.add(user)
    db.commit()
    db.refresh(user)

    return {"success": True,
            "total_pomodoros": user.total_pomodoros,
            "current_streak": user.current_streak,
            "last_completion_date": user.last_completion_date,
            "last_daily_challenge": user.last_daily_challenge_date,
            "last_sync": user.last_sync}