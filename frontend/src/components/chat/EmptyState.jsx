import { BsLightningFill } from 'react-icons/bs';
import { getTimeOfDay } from '../../utils/helpers';


const EmptyState = ({ suggestions, handleSuggestionClick, user }) => {
  return (
    <section className="h-full flex flex-col items-center justify-center ">
     <div className="p-4 rounded-full mb-4">
      <BsLightningFill 
        className="rounded-full h-16 w-16 bg-indigo-900 text-white text-4xl p-3 animate-spin" 
        aria-hidden="true" 
      />
    </div>
      <h1 className="text-2xl font-bold mb-9">
        Good {getTimeOfDay()}, {user?.username}
      </h1>
      
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 w-full max-w-4xl ">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            className="bg-transparent p-4 rounded-lg shadow-sm hover:shadow-lg cursor-pointer text-left text-gray-800 transition-all duration-100 ease-in-out"
            onClick={() => handleSuggestionClick(suggestion)}
            aria-label={`Example: ${suggestion}`}
          >
            <p className="text-gray-800 font-medium">{suggestion}</p>
          </button>
        ))}
      </div>
    </section>
  );
};

export default EmptyState;