from sqlalchemy import Column, Integer, String, Boolean,LargeBinary
from app.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), index=True)
    filepath = Column(String(255))
    is_active = Column(Boolean, default=False, index=True)
    
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(50))
    last_name = Column(String(50))
    email = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255))
    avatar = Column(LargeBinary, nullable=True)  # For binary image data