from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database import get_db
from models import User
from config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRATION

# Using bcrypt sccheme for hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# For getting the current user
security = HTTPBearer()

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password: str, hashed_password: str) -> bool:
    return pwd_context.verify(password, hashed_password)

def create_user(db: Session, in_email: str, in_password: str):
    if '@' not in in_email or '.' not in in_email:
        raise ValueError("Invalid email.")
    
    if not in_password:
        raise ValueError("Empty password is not valid.")
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == in_email).first()
    if existing_user:
        raise ValueError("User already exists.")
    
    hashed = hash_password(in_password)
    user = User(
        email = in_email,
        hashed_password = hashed
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def create_access_token(user_id: int):
    payload = {
        "sub": str(user_id),
        "exp": datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRATION),
        "iat": datetime.now(timezone.utc)
    }

    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token

def decode_access_token(token: str, db: Session):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise ValueError("Invalid or expired token")
    
    user_id = int(payload.get("sub"))
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ValueError("User not found")

    return user

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    try:
        return decode_access_token(token, db)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e), headers={"WWW-Authenticate": "Bearer"})