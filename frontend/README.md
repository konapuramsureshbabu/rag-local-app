RAG Chat Application Frontend
This is the frontend for the RAG (Retrieval-Augmented Generation) Chat Application, built with React, Vite, and Bootstrap 5. It provides a user-friendly interface for uploading documents (TXT and PDF) and chatting with a backend-powered bot that retrieves information from uploaded files using a WebSocket connection.
Features

File Upload: Drag-and-drop or click to upload .txt or .pdf files to the backend.
Chat Interface: Real-time chat with message bubbles (user: blue, right-aligned; bot: gray, left-aligned) using WebSocket.
Responsive Design: Styled with Bootstrap 5 for a modern, mobile-friendly UI.
Fast Development: Uses Vite for hot module replacement (HMR) and fast builds.

Prerequisites

Node.js 18+: Ensure Node.js is installed. Check with:node --version

Install if needed:sudo apt update
sudo apt install -y nodejs npm


Backend Server: The FastAPI backend must be running at http://localhost:8000 with WebSocket at ws://localhost:8000/ws/chat. See backend/README.md for setup instructions.
npm: Included with Node.js, used for package management.

Project Structure
frontend/
├── public/
│   └── index.html        # Entry HTML file with Bootstrap 5 CDN
├── src/
│   ├── components/
│   │   ├── Chat.jsx      # Chat interface with WebSocket
│   │   └── FileUpload.jsx # File upload component with drag-and-drop
│   ├── App.jsx           # Main app component
│   └── index.jsx         # React entry point
├── package.json          # Dependencies and scripts
├── vite.config.js        # Vite configuration
├── .gitignore            # Git ignore file
└── README.md             # This file

Setup Instructions
1. Clone the Repository
git clone <repository-url>
cd rag-app-2/frontend

Replace <repository-url> with your Git repository URL.
2. Install Dependencies
Install Node.js packages:
npm install

This installs react, react-dom, axios, bootstrap, react-bootstrap, and Vite plugins as defined in package.json.
Verify installation:
npm list react axios react-bootstrap

Expected versions (or higher):

react@18.2.0
axios@1.7.2
react-bootstrap@2.10.2

3. Run the Frontend
Start the development server with Vite:
npm run dev

Open http://localhost:5173 in a browser to view the application.
4. Configure Backend Connection
Ensure the backend is running:
cd ../backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000

The frontend connects to:

File upload: http://localhost:8000/upload
WebSocket chat: ws://localhost:8000/ws/chat

Verify these endpoints in src/components/FileUpload.jsx and src/components/Chat.jsx.
Testing the Frontend
1. Test File Upload

Open http://localhost:5173.
Drag and drop a .txt or .pdf file into the upload area or click to select.
Click "Upload" and verify the alert: "File uploaded successfully".
Check the backend:ls backend/uploads
docker exec -it mysql mysql -uroot -prootpassword -e "USE rag_db; SELECT * FROM documents;"



2. Test Chat

Upload a file (e.g., test.txt or python-certification.pdf).
In the chat input, type a query (e.g., "What is in the test document?").
Press Enter or click "Send".
Verify:
Your message appears as a blue bubble (right-aligned, labeled "You").
The bot’s response appears as a gray bubble (left-aligned, labeled "Bot").


Example:
User: "What is in the test document?"
Bot: "Based on the documents: This is a test document for RAG."



3. Test WebSocket Directly (Optional)
Use wscat to test the WebSocket connection:
npm install -g wscat
wscat -c ws://localhost:8000/ws/chat

Send:
{"text": "What is in the test document?", "sender": "user"}

Expected response (example):
{"text": "Based on the documents: This is a test document for RAG.", "sender": "bot"}

Troubleshooting

WebSocket Connection Fails:

Ensure the backend is running: uvicorn app.main:app --host 0.0.0.0 --port 8000.
Check browser console (F12) for errors.
Test with wscat as above.
Verify ws://localhost:8000/ws/chat in src/components/Chat.jsx.


File Upload Fails:

Ensure backend uploads/ directory has permissions:chmod -R 777 backend/uploads


Check backend logs:uvicorn app.main:app --host 0.0.0.0 --port 8000 --log-level debug


Verify http://localhost:8000/upload in src/components/FileUpload.jsx.


Styling Issues:

Ensure Bootstrap 5 is loaded in public/index.html.
Clear browser cache or use incognito mode.


Build Issues:

Run npm run build to check for errors.
Serve the build: npm run preview.



ESLint Configuration
This project uses Vite’s default ESLint setup for React. To expand for production:

Install ESLint:
npm install eslint --save-dev
npm init @eslint/config

Choose React and JavaScript options.

For TypeScript (optional):
npm install typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin --save-dev

Update .eslintrc with:
{
  "env": { "browser": true, "es2021": true },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["react", "@typescript-eslint"],
  "rules": {}
}



See the Vite React TS template for details.
Notes

Vite: Provides fast development with HMR and optimized builds. Two official plugins are available:
@vitejs/plugin-react: Uses Babel for Fast Refresh.
@vitejs/plugin-react-swc: Uses SWC for faster compilation (optional).


Bootstrap 5: Loaded via CDN in index.html and react-bootstrap for components.
Enhancements: Consider adding:
Message timestamps in Chat.jsx.
Loading indicators for uploads and chat responses.
TypeScript for type safety (see ESLint section).


Deployment: For production, build with npm run build and serve the dist/ folder. Consider Dockerizing or deploying to Kubernetes (e.g., Minikube).

For issues or enhancements, contact the repository owner.