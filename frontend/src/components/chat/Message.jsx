import { motion } from 'framer-motion';

const Message = ({ msg }) => {
  console.log('Message received:', msg); // Debug log to verify msg.sender

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`mb-4 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}
    >
      <div
        className={`inline-block max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg shadow ${
          msg.sender === 'user'
            ? 'bg-blue-500 text-white'
            : 'bg-white text-gray-800 border'
        }`}
      >
        <small className="block font-medium mb-1">
          {msg.sender === 'user' ? 'You' : 'AI Assistant'}
        </small>
        <p>{msg.text}</p>
        <p className="text-xs mt-1 opacity-70">
          {new Date().toLocaleTimeString()}
        </p>
      </div>
    </motion.div>
  );
};

export default Message;