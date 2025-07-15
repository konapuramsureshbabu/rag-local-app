from fastapi import FastAPI, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
import os
import logging
from app.database import SessionLocal
from app.models import Document
from app.rag import process_document

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def upload_file(file: UploadFile = File(...)):
    db: Session = SessionLocal()
    try:
        if not file.filename:
            logger.error("No file provided")
            raise HTTPException(status_code=400, detail="No file provided")
        
        content = await file.read()
        file_path = f"uploads/{file.filename}"
        os.makedirs("uploads", exist_ok=True)
        
        logger.debug(f"Saving file to {file_path}")
        with open(file_path, "wb") as f:
            f.write(content)
        
        if not os.path.exists(file_path):
            logger.error(f"File not saved at {file_path}")
            raise HTTPException(status_code=500, detail="Failed to save file")
        
        db_document = Document(filename=file.filename, filepath=file_path, is_active=False)
        db.add(db_document)
        db.commit()
        db.refresh(db_document)
        logger.debug(f"Created document: id={db_document.id}, filename={db_document.filename}")
        
        try:
            process_document(file_path, file.filename, db, db_document.id)
            logger.debug(f"Successfully processed document: {file.filename}")
        except Exception as e:
            logger.error(f"Failed to process document {file.filename}: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")
        
        return {"message": "File uploaded and processed successfully"}
    except Exception as e:
        logger.error(f"Error uploading file {file.filename}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error uploading file: {str(e)}")
    finally:
        db.close()

async def get_all_files():
    db: Session = SessionLocal()
    try:
        files = db.query(Document).all()
        return [{"id": file.id, "filename": file.filename, "filepath": file.filepath, "is_active": file.is_active} for file in files]
    finally:
        db.close()

async def get_file(id: int):
    db: Session = SessionLocal()
    try:
        file = db.query(Document).filter(Document.id == id).first()
        if not file:
            raise HTTPException(status_code=404, detail="File not found")
        return {"id": file.id, "filename": file.filename, "filepath": file.filepath, "is_active": file.is_active}
    finally:
        db.close()

async def set_active_file(id: int):
    db: Session = SessionLocal()
    try:
        db.query(Document).update({"is_active": False})
        file = db.query(Document).filter(Document.id == id).first()
        if not file:
            raise HTTPException(status_code=404, detail="File not found")
        file.is_active = True
        db.commit()
        db.refresh(file)
        return {'message': f"File {file.filename} set as active"}
    finally:
        db.close()

async def delete_all_files():
    db: Session = SessionLocal()
    try:
        db.query(Document).delete()
        db.commit()
        
        upload_dir = "uploads"
        if os.path.exists(upload_dir):
            for file in os.listdir(upload_dir):
                file_path = os.path.join(upload_dir, file)
                if os.path.isfile(file_path):
                    os.remove(file_path)
        
        return {"message": "All files deleted successfully"}
    finally:
        db.close()

async def delete_file(id: int):
    db: Session = SessionLocal()
    try:
        file = db.query(Document).filter(Document.id == id).first()
        if not file:
            raise HTTPException(status_code=404, detail="File not found")
        
        db.delete(file)
        db.commit()
        
        if os.path.exists(file.filepath):
            os.remove(file.filepath)
        
        return {"message": f"File {file.filename} deleted successfully"}
    finally:
        db.close()