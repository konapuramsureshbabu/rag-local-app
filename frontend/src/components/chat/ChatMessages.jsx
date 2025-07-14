import { useRef } from 'react';
import EmptyState from './EmptyState';
import Message from './Message';
import TypingIndicator from './TypingIndicator';

const ChatMessages = ({ messages, isTyping, suggestions, handleSuggestionClick, user }) => {
  const messagesEndRef = useRef(null);

  return (
    <article className="flex-1 overflow-y-auto  p-4 ">
      {messages.length === 0 ? (
        <EmptyState 
          suggestions={suggestions} 
          handleSuggestionClick={handleSuggestionClick} 
          user={user} 
        />
      ) : (
        <section className="max-w-3xl mx-auto">
          {messages.map((msg, index) => (
            <Message key={index} msg={msg} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </section>
      )}
    </article>
  );
};

export default ChatMessages;