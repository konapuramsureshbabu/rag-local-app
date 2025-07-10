import React from 'react';
import FileUpload from './components/FileUpload';
import Chat from './components/Chat';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    // <Container>
      // <Row>
        // <Col>
        <div>
          <h1>RAG Chat Application</h1>
          <FileUpload />
          <Chat />
        </div>
          
        // </Col>
      // </Row>
    // </Container>
  );
}

export default App;