from sqlalchemy.orm import Session
from passlib.context import CryptContext
from models import User

# Using bcrypt sccheme for hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

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