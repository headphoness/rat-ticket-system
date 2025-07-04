import React from 'react';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superuser': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'admin': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'user': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
      <div className="hidden sm:block text-right">
        <div className="text-sm font-semibold text-gray-900">{user?.username}</div>
        <div className={`text-xs px-2 py-1 rounded-full border font-medium ${getRoleColor(user?.role || '')}`}>
          {user?.role}
        </div>
      </div>
      <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
        <User className="w-4 h-4 text-white" />
      </div>
      <button
        onClick={logout}
        className="p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
};

export default UserMenu;