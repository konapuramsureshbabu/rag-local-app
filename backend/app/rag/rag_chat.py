from fastapi import WebSocket, HTTPException
from sqlalchemy.orm import Session
import logging
from app.db.database import SessionLocal
from app.models.models import Document
from app.rag.rag import query_rag

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data =await websocket.receive_json()
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
                    logger.error(f"Error processing WebSocket message: {e}", exc_info=True)
                    await websocket.send_json({"text": f"Error: {str(e)}", "sender": "bot"})
                finally:
                    db.close()
    except Exception as e:
        logger.error(f"WebSocket error: {e}", exc_info=True)
    finally:
        if websocket.client_state == 1:  # WebSocketState.CONNECTED
            logger.debug("Closing WebSocket connection")
            await websocket.close(code=1000, reason="Normal closure")