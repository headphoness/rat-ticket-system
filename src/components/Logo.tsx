import React from 'react';
import { Building2 } from 'lucide-react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center space-x-3 ml-2 lg:ml-0">
      <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
        <Building2 className="w-5 h-5 text-white" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-gray-900">TaskFlow</h1>
        <p className="text-xs text-gray-500 hidden sm:block">Enterprise Platform</p>
      </div>
    </div>
  );
};

export default Logo;