import React, { useState, useEffect, useRef } from 'react';
import { Form, Button } from 'react-bootstrap';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [ws, setWs] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const websocket = new WebSocket('ws://localhost:8000/ws/chat');
    websocket.onopen = () => console.log('WebSocket connected');
    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prev) => [...prev, { text: message.text, sender: message.sender }]);
    };
    websocket.onclose = () => console.log('WebSocket disconnected');
    setWs(websocket);

    return () => websocket.close();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (ws && input.trim()) {
      const message = { text: input, sender: 'user' };
      // Add user message to state immediately
      setMessages((prev) => [...prev, message]);
      // Send message to WebSocket
      ws.send(JSON.stringify(message));
      setInput('');
    }
  };

  return (
    <div className="mt-4">
      <h2 className="h4 text-secondary mb-3">Chat</h2>
      <div
        className="border rounded p-3 bg-white shadow-sm"
        style={{ height: '320px', overflowY: 'auto' }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`d-flex mb-2 ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
          >
            <div
              className={`p-2 rounded ${
                msg.sender === 'user'
                  ? 'bg-primary text-white'
                  : 'bg-light text-dark border'
              }`}
              style={{ maxWidth: '70%' }}
            >
              <small className="d-block">{msg.sender === 'user' ? 'You' : 'Bot'}</small>
              <p className="mb-0">{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <Form onSubmit={sendMessage} className="mt-3 d-flex gap-2">
        <Form.Control
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow-1"
        />
        <Button type="submit" variant="primary">
          Send
        </Button>
      </Form>
    </div>
  );
};

export default Chat;