import React from 'react';
import { Menu, X } from 'lucide-react';
import Notification from './Notification';
import UserMenu from './UserMenu';
import Search from './Search';
import Logo from './Logo';

interface HeaderProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
  showNotifications: boolean;
  setShowNotifications: (isOpen: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  showNotifications,
  setShowNotifications,
}) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            <Logo />
          </div>

          <div className="flex items-center space-x-4">
            <Search />
            <Notification
              showNotifications={showNotifications}
              setShowNotifications={setShowNotifications}
            />
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;