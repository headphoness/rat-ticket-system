import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileMenu from './MobileMenu';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isMobileMenuOpen={isMobileMenuOpen}
          activeTab={activeTab}
          onTabChange={onTabChange}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          userRole={user?.role}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8">
            <div className="animate-fade-in">
              {children}
            </div>
          </div>
        </main>
      </div>
      <MobileMenu isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
    </div>
  );
};

export default Layout;