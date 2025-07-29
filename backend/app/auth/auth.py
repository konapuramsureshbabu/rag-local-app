from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, constr
from typing import Optional
import re
from passlib.context import CryptContext
from PIL import Image
import io
import base64
import logging
from app.db.database import SessionLocal
from app.models.models import User

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Pydantic models for validation
class UserRegister(BaseModel):
    first_name: constr(min_length=1, max_length=50)
    last_name: constr(min_length=1, max_length=50)
    email: EmailStr
    password: constr(min_length=8)
    avatar: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def validate_password(password: str) -> bool:
    pattern = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$"
    return bool(re.match(pattern, password))

def resize_avatar(avatar_data: str, max_size=(100, 100)) -> bytes:
    if avatar_data.startswith('data:image'):
        _, encoded = avatar_data.split(',', 1)
        decoded = base64.b64decode(encoded)
    else:
        decoded = base64.b64decode(avatar_data)
    img = Image.open(io.BytesIO(decoded))
    img.thumbnail(max_size)
    output = io.BytesIO()
    img.save(output, format='PNG')
    return output.getvalue()

async def register(user: UserRegister, db: Session = Depends(get_db)):
    try:
        if not user.email.endswith("@gmail.com"):
            raise HTTPException(status_code=400, detail="Only Gmail addresses are allowed")
        if not validate_password(user.password):
            raise HTTPException(
                status_code=400,
                detail="Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number"
            )
        existing_user = db.query(User).filter(User.email == user.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")

        avatar_data = None
        if user.avatar:
            try:
                avatar_data = resize_avatar(user.avatar, max_size=(100, 100))
            except Exception as e:
                logger.error(f"Error decoding avatar: {str(e)}")
                raise HTTPException(status_code=400, detail="Invalid avatar data")

        hashed_password = pwd_context.hash(user.password)
        db_user = User(
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            hashed_password=hashed_password,
            avatar=avatar_data
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        logger.debug(f"User registered: {user.email}")
        return {"message": "User registered successfully"}
    except Exception as e:
        logger.error(f"Error registering user: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error registering user: {str(e)}")

async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.email == form_data.username).first()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        if not pwd_context.verify(form_data.password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        logger.debug(f"User logged in: {user.email}")
        return {"message": "Login successful", "user": {"email": user.email, "first_name": user.first_name, "last_name": user.last_name}}
    except Exception as e:
        logger.error(f"Error logging in user: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error logging in: {str(e)}")