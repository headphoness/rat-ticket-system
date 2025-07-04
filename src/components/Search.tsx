import React from 'react';
import { Search as SearchIcon } from 'lucide-react';

const Search: React.FC = () => {
  return (
    <div className="hidden md:flex items-center">
      <div className="relative">
        <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search tasks..."
          className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors"
        />
      </div>
    </div>
  );
};

export default Search;