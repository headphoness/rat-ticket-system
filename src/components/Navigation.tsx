import React from 'react';
import { Home, Building2, Users, BarChart3, Settings } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
  userRole: string | undefined;
}

const Navigation: React.FC<NavigationProps> = ({
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
        { id: 'analytics', label: 'Analytics', icon: BarChart3 }
      ];
    }

    if (userRole === 'admin') {
      return [
        ...baseItems,
        { id: 'tasks', label: 'Task Management', icon: Settings },
        { id: 'team-members', label: 'Team Members', icon: Users },
        { id: 'performance', label: 'Performance', icon: BarChart3 }
      ];
    }

    return [
      ...baseItems,
      { id: 'my-tasks', label: 'My Tasks', icon: Settings },
      { id: 'my-performance', label: 'Performance', icon: BarChart3 }
    ];
  };

  const navigationItems = getNavigationItems();

  return (
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
  );
};

export default Navigation;