from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import CharacterTextSplitter
from sqlalchemy.orm import Session
import os
import pypdf

# Initialize embeddings
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
vector_store = None

def process_document(file_path: str, filename: str, db: Session):
    global vector_store
    text = ""
    
    # Check file extension
    if filename.lower().endswith('.pdf'):
        # Extract text from PDF
        with open(file_path, "rb") as f:
            pdf_reader = pypdf.PdfReader(f)
            for page in pdf_reader.pages:
                text += page.extract_text() or ""
    else:
        # Handle text files
        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read()
    
    # Split text into chunks
    text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
    texts = text_splitter.split_text(text)
    
    # Create or update vector store
    if vector_store is None:
        vector_store = FAISS.from_texts(texts, embeddings, metadatas=[{"filename": filename}] * len(texts))
    else:
        vector_store.add_texts(texts, metadatas=[{"filename": filename}] * len(texts))

def query_rag(query: str) -> str:
    global vector_store
    if vector_store is None:
        return "No documents uploaded yet."
    
    docs = vector_store.similarity_search(query, k=2)
    context = "\n".join([doc.page_content for doc in docs])
    return f"Based on the documents: {context}"