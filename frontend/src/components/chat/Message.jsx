const Message = ({ msg }) => {
  return (
    <div className={`mb-4 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
      <div className={`inline-block p-3 rounded-lg ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-white text-gray-800 border'}`}>
        <small className="block font-medium mb-1">
          {msg.sender === 'user' ? 'You' : 'AI Assistant'}
        </small>
        <p>{msg.text}</p>
      </div>
    </div>
  );
};

export default Message;