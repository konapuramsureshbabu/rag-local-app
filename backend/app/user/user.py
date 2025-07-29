from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, constr
from typing import Optional
import base64
import logging
from app.db.database import SessionLocal
from app.models.models import User
from app.auth.auth import resize_avatar, validate_password, pwd_context

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Pydantic models for validation
class UserUpdate(BaseModel):
    first_name: Optional[constr(min_length=1, max_length=50)] = None
    last_name: Optional[constr(min_length=1, max_length=50)] = None
    email: Optional[EmailStr] = None
    password: Optional[constr(min_length=8)] = None
    avatar: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    avatar: Optional[str] = None

    class Config:
        orm_mode = True

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_all_users(db: Session = Depends(get_db)):
    try:
        logger.debug("Attempting to query users")
        users = db.query(User).all()
        # Convert avatar bytes to base64 string
        for user in users:
            if user.avatar:
                user.avatar = base64.b64encode(user.avatar).decode('utf-8')
        logger.debug(f"Retrieved {len(users)} users")
        return users
    except Exception as e:
        logger.error(f"Error retrieving users: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error retrieving users: {str(e)}")

async def get_user_by_email(email: str, db: Session = Depends(get_db)):
    try:
        logger.debug(f"Attempting to query user with email: {email}")
        user = db.query(User).filter(User.email == email).first()
        if not user:
            logger.warning(f"User not found: {email}")
            raise HTTPException(status_code=404, detail="User not found")
        if user.avatar:
            user.avatar = base64.b64encode(user.avatar).decode('utf-8')
        logger.debug(f"Retrieved user: {email}")
        return user
    except Exception as e:
        logger.error(f"Error retrieving user {email}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error retrieving user: {str(e)}")

async def update_user(email: str, user_update: UserUpdate, db: Session = Depends(get_db)):
    try:
        logger.debug(f"Attempting to update user with email: {email}")
        db_user = db.query(User).filter(User.email == email).first()
        if not db_user:
            logger.warning(f"User not found: {email}")
            raise HTTPException(status_code=404, detail="User not found")

        # Update fields if provided
        if user_update.first_name:
            db_user.first_name = user_update.first_name
        if user_update.last_name:
            db_user.last_name = user_update.last_name
        if user_update.email:
            if not user_update.email.endswith("@gmail.com"):
                raise HTTPException(status_code=400, detail="Only Gmail addresses are allowed")
            existing_user = db.query(User).filter(User.email == user_update.email).first()
            if existing_user and existing_user.email != email:
                raise HTTPException(status_code=400, detail="Email already registered")
            db_user.email = user_update.email
        if user_update.password:
            if not validate_password(user_update.password):
                raise HTTPException(
                    status_code=400,
                    detail="Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number"
                )
            db_user.hashed_password = pwd_context.hash(user_update.password)
        if user_update.avatar:
            try:
                avatar_data = resize_avatar(user_update.avatar, max_size=(100, 100))
                db_user.avatar = avatar_data
            except Exception as e:
                logger.error(f"Error decoding avatar: {str(e)}")
                raise HTTPException(status_code=400, detail="Invalid avatar data")

        db.commit()
        db.refresh(db_user)
        
        # Convert avatar to base64 for response
        if db_user.avatar:
            db_user.avatar = base64.b64encode(db_user.avatar).decode('utf-8')
        
        logger.debug(f"User updated: {email}")
        return db_user
    except Exception as e:
        logger.error(f"Error updating user {email}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error updating user: {str(e)}")