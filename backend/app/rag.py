
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from sqlalchemy.orm import Session
import os
import pypdf
import re
from typing import List
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Initialize embeddings
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
vector_store = None

def clean_text(text: str) -> str:
    """
    Clean extracted text by removing extra whitespace, newlines, and special characters.
    """
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'[^\x20-\x7E]', '', text)
    return text.strip()

def process_document(file_path: str, filename: str, db: Session, file_id: int = None):
    """
    Process a document (.txt or .pdf) and add it to the FAISS vector store.
    """
    global vector_store
    text = ""
    
    logger.debug(f"Processing document: {filename}, file_id: {file_id}")
    
    try:
        # Check file extension
        if filename.lower().endswith('.pdf'):
            with open(file_path, "rb") as f:
                pdf_reader = pypdf.PdfReader(f)
                for page in pdf_reader.pages:
                    extracted_text = page.extract_text() or ""
                    text += clean_text(extracted_text) + " "
        elif filename.lower().endswith('.txt'):
            with open(file_path, "r", encoding="utf-8") as f:
                text = clean_text(f.read())
        else:
            logger.error(f"Unsupported file type: {filename}")
            raise ValueError(f"Only .txt and .pdf files are supported")
        
        # Split text into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=800,
            chunk_overlap=150,
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""]
        )
        texts = text_splitter.split_text(text)
        logger.debug(f"Split text into {len(texts)} chunks")
        
        # Create metadata with file ID
        metadatas = [{"filename": filename, "file_path": file_path, "file_id": file_id} for _ in texts]
        
        # Create or update vector store
        if vector_store is None:
            vector_store = FAISS.from_texts(texts, embeddings, metadatas=metadatas)
            logger.debug("Created new FAISS vector store")
        else:
            vector_store.add_texts(texts, metadatas=metadatas)
            logger.debug("Added texts to existing FAISS vector store")
    except Exception as e:
        logger.error(f"Error processing document {filename}: {str(e)}")
        raise

def filter_context(query: str, docs: List, active_file_id: int = None) -> str:
    """
    Filters retrieved documents to include only relevant chunks, optionally from the active file.
    """
    query_keywords = set(query.lower().split())
    filtered_chunks = []
    
    logger.debug(f"Filtering context for query: {query}, active_file_id: {active_file_id}")
    for doc, score in docs:
        content = doc.page_content
        metadata = doc.metadata
        logger.debug(f"Doc: {content[:50]}..., Score: {score}, Metadata: {metadata}")
        if active_file_id and metadata.get('file_id') != active_file_id:
            logger.debug(f"Skipping doc, file_id {metadata.get('file_id')} does not match active_file_id {active_file_id}")
            continue
        if score > 0.3:
            content_lower = content.lower()
            if any(keyword in content_lower for keyword in query_keywords):
                filtered_chunks.append(content)
                logger.debug(f"Added chunk: {content[:50]}...")
    
    if not filtered_chunks:
        logger.debug("No relevant chunks found after filtering")
        return ""
    
    context = "\n\n".join([f"From {doc.metadata['filename']}:\n{chunk}" 
                          for doc, chunk in zip([d[0] for d in docs], filtered_chunks)])
    logger.debug(f"Filtered context: {context[:100]}...")
    return context

def query_rag(query: str, active_file_id: int = None) -> str:
    """
    Query the RAG system and return a response based on the active document.
    """
    global vector_store
    logger.debug(f"Received query: {query}, active_file_id: {active_file_id}")
    
    if vector_store is None:
        logger.debug("No vector store available")
        return "No documents have been uploaded or processed. Please upload a .txt or .pdf file."
    
    if active_file_id is None:
        logger.debug("No active file selected")
        return "No active file selected. Please select a file to query."
    
    # Perform similarity search with scores
    docs_and_scores = vector_store.similarity_search_with_score(query, k=3)
    logger.debug(f"Retrieved {len(docs_and_scores)} documents from similarity search")
    
    # Filter context for active file
    filtered_context = filter_context(query, docs_and_scores, active_file_id)
    
    if not filtered_context.strip():
        logger.debug("No relevant information found in the active document")
        return f"No relevant information found in the active document for query: {query}"
    
    # Simplified prompt for precise answers
    prompt = f"""
    Context: {filtered_context}
    """
    
    # Placeholder response; replace with LLM integration for production
    response = f"Based on the retrieved context:\n{filtered_context[:200]} "
    logger.debug("Generated placeholder response")
    return response

# Example Usage
if __name__ == "__main__":
    from unittest.mock import MagicMock
    
    # Mock SQLAlchemy Session and Document for standalone testing
    db = MagicMock(spec=Session)
    
    # Create a sample .txt file for testing
    sample_file = "sample.txt"
    with open(sample_file, "w", encoding="utf-8") as f:
        f.write("Practice makes perfect. Hard work leads to success. Consistency is key to improvement.")
    
    # Process the sample file
    process_document(sample_file, "sample.txt", db, file_id=1)
    
    # Example query
    query = "How can I improve?"
    response = query_rag(query, active_file_id=1)
    print(response)