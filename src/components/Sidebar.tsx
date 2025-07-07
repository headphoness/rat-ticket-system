import React from 'react';
import { Home, Users, Building2, Ticket, BarChart3, Settings, UserPlus, Plus } from 'lucide-react';

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
  const getNavigationItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Home }
    ];

    if (userRole === 'superuser') {
      return [
        ...baseItems,
        { id: 'teams', label: 'Teams', icon: Building2 },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'tickets', label: 'All Tickets', icon: Ticket },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'settings', label: 'Settings', icon: Settings }
      ];
    }

    if (userRole === 'admin') {
      return [
        ...baseItems,
        { id: 'team-tickets', label: 'Team Tickets', icon: Ticket },
        { id: 'team-members', label: 'Team Members', icon: Users },
        { id: 'create-ticket', label: 'Create Ticket', icon: Plus },
        { id: 'add-member', label: 'Add Member', icon: UserPlus },
        { id: 'team-analytics', label: 'Team Analytics', icon: BarChart3 }
      ];
    }

    return [
      ...baseItems,
      { id: 'my-tickets', label: 'My Tickets', icon: Ticket },
      { id: 'create-ticket', label: 'Create Ticket', icon: Plus },
      { id: 'my-analytics', label: 'My Analytics', icon: BarChart3 }
    ];
  };

  const navigationItems = getNavigationItems();

  return (
    <>
      <nav className={`${isMobileMenuOpen ? 'block' : 'hidden'} lg:block w-64 bg-white shadow-sm border-r border-gray-200 flex-shrink-0 z-30`}>
        <div className="p-6 h-full overflow-y-auto">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;