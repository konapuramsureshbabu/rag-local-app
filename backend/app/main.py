from fastapi import FastAPI, UploadFile, File, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import Base, Document
from app.rag import process_document, query_rag
import os

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

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    db: Session = SessionLocal()
    try:
        content = await file.read()
        file_path = f"uploads/{file.filename}"
        os.makedirs("uploads", exist_ok=True)
        with open(file_path, "wb") as f:
            f.write(content)
        
        # Process document for RAG
        process_document(file_path, file.filename, db)
        
        # Store metadata in MySQL
        db_document = Document(filename=file.filename, filepath=file_path)
        db.add(db_document)
        db.commit()
        db.refresh(db_document)
        return {"message": "File uploaded and processed successfully"}
    finally:
        db.close()

@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            if data["sender"] == "user":
                response = query_rag(data["text"])
                await websocket.send_json({"text": response, "sender": "bot"})
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await websocket.close()