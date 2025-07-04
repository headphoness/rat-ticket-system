import React from 'react';
import Navigation from './Navigation';

interface SidebarProps {
  isMobileMenuOpen: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
  userRole: string | undefined;
}

const Sidebar: React.FC<SidebarProps> = ({
  isMobileMenuOpen,
  activeTab,
  onTabChange,
  setIsMobileMenuOpen,
  userRole,
}) => {
  return (
    <>
      <nav className={`${isMobileMenuOpen ? 'block' : 'hidden'} lg:block w-64 bg-white shadow-sm border-r border-gray-200 flex-shrink-0`}>
        <div className="p-6 h-full overflow-y-auto">
          <Navigation
            activeTab={activeTab}
            onTabChange={onTabChange}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            userRole={userRole}
          />
        </div>
      </nav>
    </>
  );
};

export default Sidebar;