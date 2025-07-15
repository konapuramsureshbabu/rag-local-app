from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app.models import Base
from .auth import register, login
from .user import get_all_users, get_user_by_email, update_user
from .file import upload_file, get_all_files, get_file, set_active_file, delete_all_files, delete_file
from .rag_chat import websocket_endpoint

app = FastAPI()

# CORS configuration
origins = ["http://localhost:5173", "http://localhost:80"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Authentication endpoints
app.post("/register")(register)
app.post("/login")(login)

# User endpoints
app.get("/users")(get_all_users)
app.get("/user/{email}")(get_user_by_email)
app.put("/user/{email}")(update_user)

# File endpoints
app.post("/upload")(upload_file)
app.get("/files")(get_all_files)
app.get("/file/{id}")(get_file)
app.post("/file/{id}/set-active")(set_active_file)
app.delete("/files")(delete_all_files)
app.delete("/file/{id}")(delete_file)

# WebSocket endpoint
app.websocket("/ws/chat")(websocket_endpoint)