import { BsLightningFill } from 'react-icons/bs';
import { getTimeOfDay } from '../../utils/helpers';


const EmptyState = ({ suggestions, handleSuggestionClick, user }) => {
  return (
    <section className="h-full flex flex-col items-center justify-center">
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-full mb-4">
        <BsLightningFill className="text-white text-4xl" aria-hidden="true" />
      </div>
      <h1 className="text-2xl font-bold mb-2">
        Good {getTimeOfDay()}, {user?.username}
      </h1>
      
      <h2 className="text-lg font-semibold mb-3">GET STARTED </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 w-full max-w-4xl">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md cursor-pointer text-left"
            onClick={() => handleSuggestionClick(suggestion)}
            aria-label={`Example: ${suggestion}`}
          >
            <p className="text-gray-800">{suggestion}</p>
          </button>
        ))}
      </div>
    </section>
  );
};

export default EmptyState;