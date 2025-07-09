RAG Chat Application Backend
This is the backend for the RAG (Retrieval-Augmented Generation) Chat Application, built with FastAPI, SQLAlchemy, and LangChain. It supports file uploads (TXT and PDF), stores metadata in a MySQL database, and provides a WebSocket-based chat interface for querying uploaded documents using a FAISS vector store.
Prerequisites

Python 3.12: Ensure Python 3.12 is installed. Check with:python3 --version


Docker: Required for running MySQL. Install with:sudo apt update
sudo apt install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker


npm (optional): For testing WebSocket with wscat. Install with:sudo apt install -y npm



Project Structure
backend/
├── app/
│   ├── main.py         # FastAPI application with upload and WebSocket endpoints
│   ├── rag.py          # RAG logic for processing documents and querying
│   ├── database.py     # SQLAlchemy database configuration
│   ├── models.py       # SQLAlchemy models for MySQL
├── uploads/            # Directory for uploaded files (excluded in .gitignore)
├── requirements.txt    # Python dependencies
├── .gitignore          # Git ignore file
└── README.md           # This file

Setup Instructions
1. Clone the Repository
git clone <repository-url>
cd rag-app-2/backend

Replace <repository-url> with your Git repository URL.
2. Set Up Python Virtual Environment
python3 -m venv venv
source venv/bin/activate

3. Install Dependencies
Install the required Python packages from requirements.txt:
pip install -r requirements.txt

If you encounter issues with torch on a CPU-based system, install the CPU-only version:
pip install torch==2.7.1 --index-url https://download.pytorch.org/whl/cpu

Verify installations:
python -c "import pymysql, cryptography, langchain_huggingface, sqlalchemy, fastapi, pypdf"
uvicorn --version

Expected uvicorn version: 0.30.6.
4. Run MySQL in Docker
Start a MySQL container with the database rag_db:
docker run -d --name mysql -e MYSQL_ROOT_PASSWORD=rootpassword -e MYSQL_DATABASE=rag_db -p 3310:3306 mysql:8.0

Verify the container is running:
docker ps

Test the MySQL connection:
mysql -h localhost -P 3310 -uroot -prootpassword -e "SELECT 1;"

Expected output:
+---+
| 1 |
+---+
| 1 |
+---+

If you get an Access denied error, reset the root user:
docker exec -it mysql mysql -uroot -prootpassword

ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'rootpassword';
FLUSH PRIVILEGES;
EXIT;

5. Initialize the Database
Create the documents table in the rag_db database:
python -c "from app.database import Base, engine; Base.metadata.create_all(bind=engine)"

Verify the table:
docker exec -it mysql mysql -uroot -prootpassword -e "USE rag_db; DESCRIBE documents;"

Expected output:
+----------+--------------+------+-----+---------+----------------+
| Field    | Type         | Null | Key | Default | Extra          |
+----------+--------------+------+-----+---------+----------------+
| id       | int          | NO   | PRI | NULL    | auto_increment |
| filename | varchar(255) | YES  | MUL | NULL    |                |
| filepath | varchar(255) | YES  |     | NULL    |                |
+----------+--------------+------+-----+---------+----------------+

6. Create Uploads Directory
Create a directory for uploaded files and set permissions:
mkdir -p uploads
chmod -R 777 uploads

7. Run the Backend
Start the FastAPI server:
uvicorn app.main:app --host 0.0.0.0 --port 8000

Open http://localhost:8000/docs in a browser to view the FastAPI Swagger UI with /upload (POST) and /ws/chat (WebSocket) endpoints.
Testing the Backend
1. Test File Upload
Upload a PDF or text file:
echo "This is a test document for RAG." > test.txt
curl -X POST \
  "http://localhost:8000/upload" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test.txt;type=text/plain"

Or for a PDF:
curl -X POST \
  "http://localhost:8000/upload" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@python-certification.pdf;type=application/pdf"

Expected response:
{"message": "File uploaded and processed successfully"}

Verify the file and database:
ls uploads
docker exec -it mysql mysql -uroot -prootpassword -e "USE rag_db; SELECT * FROM documents;"

2. Test WebSocket Chat
Install wscat for testing:
npm install -g wscat

Connect to the WebSocket:
wscat -c ws://localhost:8000/ws/chat

Send a message:
{"text": "What is in the test document?", "sender": "user"}

Expected response (example):
{"text": "Based on the documents: This is a test document for RAG.", "sender": "bot"}

3. Test with Frontend (Optional)
If using the React frontend:
cd ../frontend
npm install
npm run dev

Open http://localhost:5173, upload a file, and test the chat interface.
Troubleshooting

MySQL Connection Issues:

Check container logs: docker logs mysql
Retry connection: mysql -h localhost -P 3310 -uroot -prootpassword -e "SELECT 1;"
Reset credentials if needed:docker exec -it mysql mysql -uroot -prootpassword

SET PASSWORD FOR 'root'@'localhost' = 'rootpassword';
FLUSH PRIVILEGES;
EXIT;




File Upload Issues:

Ensure uploads/ permissions: chmod -R 777 uploads
Check backend logs: uvicorn app.main:app --host 0.0.0.0 --port 8000 --log-level debug
Verify pypdf for PDFs: python -c "import pypdf"


WebSocket Issues:

Test with wscat as above.
Check browser console or backend logs for errors.


Dependency Issues:

Reinstall dependencies: pip install -r requirements.txt
Verify: python -c "import pymysql, cryptography, langchain_huggingface, sqlalchemy, fastapi, pypdf"



Notes

Database: Uses MySQL 8.0 in Docker, mapped to localhost:3310. Update app/database.py if you prefer port 3306.
File Support: Supports .txt and .pdf files via pypdf in app/rag.py.
RAG: Uses all-MiniLM-L6-v2 for embeddings and FAISS for vector storage. Consider adding a local LLM for better responses.
Logging: Add debug prints in app/rag.py if RAG responses are incorrect.

For further development, consider Dockerizing the backend or deploying to Kubernetes (e.g., Minikube). Contact the repository owner for issues or enhancements.