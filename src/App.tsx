import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import SuperuserDashboard from './components/SuperuserDashboard';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    if (activeTab === 'dashboard') {
      return <Dashboard />;
    }

    if (user.role === 'superuser') {
      return <SuperuserDashboard activeTab={activeTab} />;
    }

    if (user.role === 'admin') {
      return <AdminDashboard activeTab={activeTab} />;
    }

    if (user.role === 'user') {
      return <UserDashboard activeTab={activeTab} />;
    }

    return <Dashboard />;
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;