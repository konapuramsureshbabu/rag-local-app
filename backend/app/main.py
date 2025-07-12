from fastapi import FastAPI, UploadFile, File, WebSocket, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import Base, Document
from app.rag import process_document, query_rag
import os
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

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
        # Validate file
        if not file.filename:
            logger.error("No file provided")
            raise HTTPException(status_code=400, detail="No file provided")
        
        content = await file.read()
        file_path = f"uploads/{file.filename}"
        os.makedirs("uploads", exist_ok=True)
        
        # Save file to disk
        logger.debug(f"Saving file to {file_path}")
        with open(file_path, "wb") as f:
            f.write(content)
        
        # Verify file exists
        if not os.path.exists(file_path):
            logger.error(f"File not saved at {file_path}")
            raise HTTPException(status_code=500, detail="Failed to save file")
        
        # Store metadata in MySQL
        db_document = Document(filename=file.filename, filepath=file_path, is_active=False)
        db.add(db_document)
        db.commit()
        db.refresh(db_document)
        logger.debug(f"Created document: id={db_document.id}, filename={db_document.filename}")
        
        # Process document for RAG
        try:
            process_document(file_path, file.filename, db, db_document.id)
            logger.debug(f"Successfully processed document: {file.filename}")
        except Exception as e:
            logger.error(f"Failed to process document {file.filename}: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")
        
        return {"message": "File uploaded and processed successfully"}
    except Exception as e:
        logger.error(f"Error uploading file {file.filename}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error uploading file: {str(e)}")
    finally:
        db.close()

@app.get("/files")
async def get_all_files():
    db: Session = SessionLocal()
    try:
        files = db.query(Document).all()
        return [{"id": file.id, "filename": file.filename, "filepath": file.filepath, "is_active": file.is_active} for file in files]
    finally:
        db.close()

@app.get("/file/{id}")
async def get_file(id: int):
    db: Session = SessionLocal()
    try:
        file = db.query(Document).filter(Document.id == id).first()
        if not file:
            raise HTTPException(status_code=404, detail="File not found")
        return {"id": file.id, "filename": file.filename, "filepath": file.filepath, "is_active": file.is_active}
    finally:
        db.close()

@app.post("/file/{id}/set-active")
async def set_active_file(id: int):
    db: Session = SessionLocal()
    try:
        # Deactivate all files
        db.query(Document).update({"is_active": False})
        # Activate the selected file
        file = db.query(Document).filter(Document.id == id).first()
        if not file:
            raise HTTPException(status_code=404, detail="File not found")
        file.is_active = True
        db.commit()
        db.refresh(file)
        return {"message": f"File {file.filename} set as active"}
    finally:
        db.close()

@app.delete("/files")
async def delete_all_files():
    db: Session = SessionLocal()
    try:
        # Delete all files from database
        db.query(Document).delete()
        db.commit()
        
        # Delete all files from uploads directory
        upload_dir = "uploads"
        if os.path.exists(upload_dir):
            for file in os.listdir(upload_dir):
                file_path = os.path.join(upload_dir, file)
                if os.path.isfile(file_path):
                    os.remove(file_path)
        
        return {"message": "All files deleted successfully"}
    finally:
        db.close()

@app.delete("/file/{id}")
async def delete_file(id: int):
    db: Session = SessionLocal()
    try:
        file = db.query(Document).filter(Document.id == id).first()
        if not file:
            raise HTTPException(status_code=404, detail="File not found")
        
        # Delete file from database
        db.delete(file)
        db.commit()
        
        # Delete file from filesystem
        if os.path.exists(file.filepath):
            os.remove(file.filepath)
        
        return {"message": f"File {file.filename} deleted successfully"}
    finally:
        db.close()

@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            if data["sender"] == "user":
                db: Session = SessionLocal()
                try:
                    if data["text"].startswith("Selected file:"):
                        await websocket.send_json({"text": "File selected successfully", "sender": "bot"})
                        continue
                    active_file = db.query(Document).filter(Document.is_active == True).first()
                    active_file_id = active_file.id if active_file else None
                    response = query_rag(data["text"], active_file_id)
                    await websocket.send_json({"text": response, "sender": "bot"})
                except Exception as e:
                    logger.error(f"Error processing WebSocket message: {e}")
                    await websocket.send_json({"text": f"Error: {str(e)}", "sender": "bot"})
                finally:
                    db.close()
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        if websocket.client_state == 1:  # WebSocketState.CONNECTED
            logger.debug("Closing WebSocket connection")
            await websocket.close(code=1000, reason="Normal closure")