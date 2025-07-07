import React, { useState, useEffect } from 'react';
import { Users, Ticket, Clock, AlertTriangle, TrendingUp, Award, Target, Building2, Calendar, Activity, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getTickets, getUsers, getTeams } from '../utils/storage';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const tickets = getTickets();
  const users = getUsers();
  const teams = getTeams();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const getStats = () => {
    if (user?.role === 'superuser') {
      const totalTickets = tickets.length;
      const openTickets = tickets.filter(t => t.status === 'open').length;
      const inProgressTickets = tickets.filter(t => t.status === 'in-progress').length;
      const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
      const overdueTickets = tickets.filter(t => 
        t.dueDate && new Date(t.dueDate) < new Date() && !['resolved', 'closed'].includes(t.status)
      ).length;

      return [
        {
          label: 'Total Users',
          value: users.length,
          icon: Users,
          color: 'from-blue-500 to-blue-600',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-600',
          trend: { value: 12, isPositive: true }
        },
        {
          label: 'Active Teams',
          value: teams.length,
          icon: Building2,
          color: 'from-green-500 to-green-600',
          bgColor: 'bg-green-50',
          textColor: 'text-green-600',
          trend: { value: 8, isPositive: true }
        },
        {
          label: 'Total Tickets',
          value: totalTickets,
          icon: Ticket,
          color: 'from-purple-500 to-purple-600',
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-600',
          trend: { value: 15, isPositive: true }
        },
        {
          label: 'Resolution Rate',
          value: `${totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0}%`,
          icon: Award,
          color: 'from-emerald-500 to-emerald-600',
          bgColor: 'bg-emerald-50',
          textColor: 'text-emerald-600',
          trend: { value: 5, isPositive: true }
        }
      ];
    }

    if (user?.role === 'admin') {
      const teamTickets = tickets.filter(t => t.teamId === user.teamId);
      const openTickets = teamTickets.filter(t => t.status === 'open').length;
      const inProgressTickets = teamTickets.filter(t => t.status === 'in-progress').length;
      const resolvedTickets = teamTickets.filter(t => t.status === 'resolved').length;
      const overdueTickets = teamTickets.filter(t => 
        t.dueDate && new Date(t.dueDate) < new Date() && !['resolved', 'closed'].includes(t.status)
      ).length;

      return [
        {
          label: 'Team Tickets',
          value: teamTickets.length,
          icon: Target,
          color: 'from-blue-500 to-blue-600',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-600',
          trend: { value: 10, isPositive: true }
        },
        {
          label: 'Resolved',
          value: resolvedTickets,
          icon: CheckCircle,
          color: 'from-green-500 to-green-600',
          bgColor: 'bg-green-50',
          textColor: 'text-green-600',
          trend: { value: 18, isPositive: true }
        },
        {
          label: 'In Progress',
          value: inProgressTickets,
          icon: Clock,
          color: 'from-yellow-500 to-yellow-600',
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-600',
          trend: { value: 3, isPositive: false }
        },
        {
          label: 'Overdue',
          value: overdueTickets,
          icon: AlertTriangle,
          color: 'from-red-500 to-red-600',
          bgColor: 'bg-red-50',
          textColor: 'text-red-600',
          trend: { value: 25, isPositive: false }
        }
      ];
    }

    const myTickets = tickets.filter(t => t.assignedTo === user?.id || t.reportedBy === user?.id);
    const openTickets = myTickets.filter(t => t.status === 'open').length;
    const inProgressTickets = myTickets.filter(t => t.status === 'in-progress').length;
    const resolvedTickets = myTickets.filter(t => t.status === 'resolved').length;
    const overdueTickets = myTickets.filter(t => 
      t.dueDate && new Date(t.dueDate) < new Date() && !['resolved', 'closed'].includes(t.status)
    ).length;

    return [
      {
        label: 'My Tickets',
        value: myTickets.length,
        icon: Target,
        color: 'from-blue-500 to-blue-600',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-600',
        trend: { value: 5, isPositive: true }
      },
      {
        label: 'Resolved',
        value: resolvedTickets,
        icon: CheckCircle,
        color: 'from-green-500 to-green-600',
        bgColor: 'bg-green-50',
        textColor: 'text-green-600',
        trend: { value: 20, isPositive: true }
      },
      {
        label: 'In Progress',
        value: inProgressTickets,
        icon: Clock,
        color: 'from-yellow-500 to-yellow-600',
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-600',
        trend: { value: 0, isPositive: true }
      },
      {
        label: 'Overdue',
        value: overdueTickets,
        icon: AlertTriangle,
        color: 'from-red-500 to-red-600',
        bgColor: 'bg-red-50',
        textColor: 'text-red-600',
        trend: { value: 10, isPositive: false }
      }
    ];
  };

  const getRecentActivity = () => {
    let relevantTickets = [];
    
    if (user?.role === 'user') {
      relevantTickets = tickets.filter(t => t.assignedTo === user.id || t.reportedBy === user.id);
    } else if (user?.role === 'admin') {
      relevantTickets = tickets.filter(t => t.teamId === user.teamId);
    } else {
      relevantTickets = tickets;
    }

    return relevantTickets
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  };

  const getPerformanceData = () => {
    if (user?.role === 'superuser') {
      return teams.map(team => {
        const teamTickets = tickets.filter(ticket => ticket.teamId === team.id);
        const resolvedTickets = teamTickets.filter(ticket => ticket.status === 'resolved').length;
        return {
          name: team.name,
          resolved: resolvedTickets,
          total: teamTickets.length,
          performance: teamTickets.length > 0 ? Math.round((resolvedTickets / teamTickets.length) * 100) : 0
        };
      });
    }

    if (user?.role === 'admin') {
      const teamMembers = users.filter(u => u.teamId === user.teamId && u.role === 'user');
      return teamMembers.map(member => {
        const memberTickets = tickets.filter(ticket => ticket.assignedTo === member.id);
        const resolvedTickets = memberTickets.filter(ticket => ticket.status === 'resolved').length;
        return {
          name: member.firstName,
          resolved: resolvedTickets,
          total: memberTickets.length,
          performance: memberTickets.length > 0 ? Math.round((resolvedTickets / memberTickets.length) * 100) : 0
        };
      });
    }

    // User performance over time
    const myTickets = tickets.filter(t => t.assignedTo === user?.id || t.reportedBy === user?.id);
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const resolvedTickets = myTickets.filter(ticket => 
        ticket.resolvedAt && new Date(ticket.resolvedAt).toISOString().split('T')[0] === date
      );
      return {
        name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        resolved: resolvedTickets.length,
        total: myTickets.length
      };
    });
  };

  const getTicketDistribution = () => {
    const relevantTickets = user?.role === 'user' 
      ? tickets.filter(t => t.assignedTo === user.id || t.reportedBy === user.id)
      : user?.role === 'admin'
      ? tickets.filter(t => t.teamId === user.teamId)
      : tickets;

    const statusCount = relevantTickets.reduce((acc, ticket) => {
      acc[ticket.status] = (acc[ticket.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: 'Open', value: statusCount.open || 0, color: '#EF4444' },
      { name: 'In Progress', value: statusCount['in-progress'] || 0, color: '#3B82F6' },
      { name: 'Resolved', value: statusCount.resolved || 0, color: '#10B981' },
      { name: 'Closed', value: statusCount.closed || 0, color: '#6B7280' }
    ];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'urgent': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'high': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'open': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'closed': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const stats = getStats();
  const recentTickets = getRecentActivity();
  const performanceData = getPerformanceData();
  const ticketDistribution = getTicketDistribution();

  return (
    <div className="space-y-8">
      {/* Enhanced Header with Time */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">{getGreeting()}, {user?.firstName}!</h1>
              <p className="text-indigo-100 text-lg mb-4">Here's your ticketing system overview and recent activity.</p>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono text-lg">{formatTime(currentTime)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4" />
                  <span>Last login: {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Today'}</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <TrendingUp className="w-16 h-16 text-white/80" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                  {stat.trend && (
                    <div className={`flex items-center text-sm ${stat.trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      <TrendingUp className={`w-4 h-4 mr-1 ${stat.trend.isPositive ? '' : 'rotate-180'}`} />
                      <span>{stat.trend.value}% from last month</span>
                    </div>
                  )}
                </div>
                <div className={`${stat.bgColor} p-4 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-8 h-8 ${stat.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enhanced Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {user?.role === 'superuser' ? 'Team Performance' : 
               user?.role === 'admin' ? 'Member Performance' : 'My Weekly Progress'}
            </h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {user?.role === 'user' ? (
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="resolved" 
                    stroke="#6366F1" 
                    strokeWidth={3} 
                    dot={{ fill: '#6366F1', strokeWidth: 2, r: 6 }} 
                  />
                </LineChart>
              ) : (
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Bar dataKey="resolved" fill="#10B981" name="Resolved" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="total" fill="#E5E7EB" name="Total" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ticket Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Ticket Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ticketDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                >
                  {ticketDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
        </div>
        
        <div className="p-6">
          {recentTickets.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No recent activity</p>
              <p className="text-gray-400 text-sm">Tickets will appear here as they are created or updated</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTickets.map((ticket) => {
                const assignedUser = users.find(u => u.id === ticket.assignedTo);
                const reportedByUser = users.find(u => u.id === ticket.reportedBy);
                const isOverdue = ticket.dueDate && new Date(ticket.dueDate) < new Date() && !['resolved', 'closed'].includes(ticket.status);
                
                return (
                  <div key={ticket.id} className={`flex items-center justify-between p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-md ${
                    isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                  }`}>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-900 text-lg">{ticket.title}</h3>
                            {isOverdue && (
                              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">
                                OVERDUE
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>
                          <div className="flex items-center space-x-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority.toUpperCase()}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(ticket.status)}`}>
                              {ticket.status.replace('-', ' ').toUpperCase()}
                            </span>
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                              {ticket.category}
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-6">
                          <div className="text-sm text-gray-500 mb-1">
                            Created: {new Date(ticket.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500 mb-1">
                            Updated: {new Date(ticket.updatedAt).toLocaleDateString()}
                          </div>
                          {ticket.dueDate && (
                            <div className={`text-sm mb-1 ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                              Due: {new Date(ticket.dueDate).toLocaleDateString()}
                            </div>
                          )}
                          {assignedUser && (
                            <div className="text-xs text-gray-400">
                              Assigned to: <span className="font-medium">{assignedUser.firstName} {assignedUser.lastName}</span>
                            </div>
                          )}
                          {reportedByUser && (
                            <div className="text-xs text-gray-400">
                              Reported by: <span className="font-medium">{reportedByUser.firstName} {reportedByUser.lastName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;