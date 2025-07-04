import React from 'react';

interface MobileMenuProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  if (!isMobileMenuOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
      onClick={() => setIsMobileMenuOpen(false)}
    />
  );
};

export default MobileMenu;