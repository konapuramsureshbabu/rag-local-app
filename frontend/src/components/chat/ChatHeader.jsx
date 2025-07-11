import { FiSearch } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { setVersion } from '../../features/ui/uiSlice';

const ChatHeader = () => {
  const dispatch = useDispatch();
  const { version, versions } = useSelector((state) => state.ui);

  return (
    <header className="bg-white border-b p-1 flex items-center justify-between">
      <div className="flex items-center space-x-3 p-2">
        <label htmlFor="version" className="text-sm font-medium text-gray-700">
          Select Version:
        </label>
        <select
          id="version"
          value={version}
          onChange={(e) => dispatch(setVersion(e.target.value))}
          className="px-1 py-1 border border-gray-300 rounded-md"
          aria-label="Select AI version"
        >
          {versions.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center space-x-3 p-3">
        <div className="relative">
          <FiSearch className="absolute left-3 top-2.5 text-gray-400" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search threads..."
            className="pl-10 pr-4 py-1 border border-gray-300 rounded-full"
            aria-label="Search chat threads"
          />
        </div>
        <button className="bg-amber-200 hover:bg-gray-200 cursor-pointer rounded-md w-18 h-9" aria-label="Invite someone">
          Invite
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;