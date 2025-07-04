import React, { useState, useEffect } from 'react';
import { Users, CheckSquare, Clock, AlertTriangle, TrendingUp, Award, Target, Building2, Calendar, Activity, Search, Filter, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getTasks, getUsers, getTeams } from '../utils/storage';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const tasks = getTasks();
  const users = getUsers();
  const teams = getTeams();
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const getStats = () => {
    if (user?.role === 'superuser') {
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const overdueTasks = tasks.filter(t => 
        t.endDate && new Date(t.endDate) < new Date() && t.status !== 'completed'
      ).length;
      const activeUsers = users.filter(u => u.role !== 'superuser').length;

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
          label: 'Total Tasks',
          value: totalTasks,
          icon: CheckSquare,
          color: 'from-purple-500 to-purple-600',
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-600',
          trend: { value: 15, isPositive: true }
        },
        {
          label: 'Completion Rate',
          value: `${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%`,
          icon: Award,
          color: 'from-emerald-500 to-emerald-600',
          bgColor: 'bg-emerald-50',
          textColor: 'text-emerald-600',
          trend: { value: 5, isPositive: true }
        }
      ];
    }

    if (user?.role === 'admin') {
      const teamTasks = tasks.filter(t => t.teamId === user.teamId);
      const completedTasks = teamTasks.filter(t => t.status === 'completed').length;
      const inProgressTasks = teamTasks.filter(t => t.status === 'in-progress').length;
      const overdueTasks = teamTasks.filter(t => 
        t.endDate && new Date(t.endDate) < new Date() && t.status !== 'completed'
      ).length;

      return [
        {
          label: 'Team Tasks',
          value: teamTasks.length,
          icon: Target,
          color: 'from-blue-500 to-blue-600',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-600',
          trend: { value: 10, isPositive: true }
        },
        {
          label: 'Completed',
          value: completedTasks,
          icon: Award,
          color: 'from-green-500 to-green-600',
          bgColor: 'bg-green-50',
          textColor: 'text-green-600',
          trend: { value: 18, isPositive: true }
        },
        {
          label: 'In Progress',
          value: inProgressTasks,
          icon: Clock,
          color: 'from-yellow-500 to-yellow-600',
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-600',
          trend: { value: 3, isPositive: false }
        },
        {
          label: 'Overdue',
          value: overdueTasks,
          icon: AlertTriangle,
          color: 'from-red-500 to-red-600',
          bgColor: 'bg-red-50',
          textColor: 'text-red-600',
          trend: { value: 25, isPositive: false }
        }
      ];
    }

    const myTasks = tasks.filter(t => t.assignedTo === user?.id);
    const completedTasks = myTasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = myTasks.filter(t => t.status === 'in-progress').length;
    const overdueTasks = myTasks.filter(t => 
      t.endDate && new Date(t.endDate) < new Date() && t.status !== 'completed'
    ).length;

    return [
      {
        label: 'My Tasks',
        value: myTasks.length,
        icon: Target,
        color: 'from-blue-500 to-blue-600',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-600',
        trend: { value: 5, isPositive: true }
      },
      {
        label: 'Completed',
        value: completedTasks,
        icon: Award,
        color: 'from-green-500 to-green-600',
        bgColor: 'bg-green-50',
        textColor: 'text-green-600',
        trend: { value: 20, isPositive: true }
      },
      {
        label: 'In Progress',
        value: inProgressTasks,
        icon: Clock,
        color: 'from-yellow-500 to-yellow-600',
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-600',
        trend: { value: 0, isPositive: true }
      },
      {
        label: 'Overdue',
        value: overdueTasks,
        icon: AlertTriangle,
        color: 'from-red-500 to-red-600',
        bgColor: 'bg-red-50',
        textColor: 'text-red-600',
        trend: { value: 10, isPositive: false }
      }
    ];
  };

  const getRecentActivity = () => {
    let relevantTasks = [];
    
    if (user?.role === 'user') {
      relevantTasks = tasks.filter(t => t.assignedTo === user.id);
    } else if (user?.role === 'admin') {
      relevantTasks = tasks.filter(t => t.teamId === user.teamId);
    } else {
      relevantTasks = tasks;
    }

    return relevantTasks
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  };

  const getFilteredRecentActivity = () => {
    const recentTasks = getRecentActivity();
    
    return recentTasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  };

  const getPerformanceData = () => {
    if (user?.role === 'superuser') {
      return teams.map(team => {
        const teamTasks = tasks.filter(task => task.teamId === team.id);
        const completedTasks = teamTasks.filter(task => task.status === 'completed').length;
        return {
          name: team.name,
          completed: completedTasks,
          total: teamTasks.length,
          performance: teamTasks.length > 0 ? Math.round((completedTasks / teamTasks.length) * 100) : 0
        };
      });
    }

    if (user?.role === 'admin') {
      const teamMembers = users.filter(u => u.teamId === user.teamId && u.role === 'user');
      return teamMembers.map(member => {
        const memberTasks = tasks.filter(task => task.assignedTo === member.id);
        const completedTasks = memberTasks.filter(task => task.status === 'completed').length;
        return {
          name: member.username,
          completed: completedTasks,
          total: memberTasks.length,
          performance: memberTasks.length > 0 ? Math.round((completedTasks / memberTasks.length) * 100) : 0
        };
      });
    }

    // User performance over time
    const myTasks = tasks.filter(t => t.assignedTo === user?.id);
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const completedTasks = myTasks.filter(task => 
        task.completedAt && new Date(task.completedAt).toISOString().split('T')[0] === date
      );
      return {
        name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        completed: completedTasks.length,
        total: myTasks.length
      };
    });
  };

  const getTaskDistribution = () => {
    const relevantTasks = user?.role === 'user' 
      ? tasks.filter(t => t.assignedTo === user.id)
      : user?.role === 'admin'
      ? tasks.filter(t => t.teamId === user.teamId)
      : tasks;

    const statusCount = relevantTasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: 'Completed', value: statusCount.completed || 0, color: '#10B981' },
      { name: 'In Progress', value: statusCount['in-progress'] || 0, color: '#3B82F6' },
      { name: 'Open', value: statusCount.open || 0, color: '#EF4444' }
    ];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'open': return 'bg-gray-100 text-gray-800 border-gray-200';
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
  const recentTasks = getFilteredRecentActivity();
  const performanceData = getPerformanceData();
  const taskDistribution = getTaskDistribution();

  return (
    <div className="space-y-8">
      {/* Enhanced Header with Time */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">{getGreeting()}, {user?.username}!</h1>
              <p className="text-indigo-100 text-lg mb-4">Here's your performance overview and recent activity.</p>
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
            <select 
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
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
                    dataKey="completed" 
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
                  <Bar dataKey="completed" fill="#10B981" name="Completed" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="total" fill="#E5E7EB" name="Total" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Task Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                >
                  {taskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Enhanced Recent Activity with Professional Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            
            {/* Professional Filter Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm w-full sm:w-64"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="all">All Priority</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <SlidersHorizontal className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {recentTasks.length === 0 ? (
            <div className="text-center py-12">
              <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No activities found</p>
              <p className="text-gray-400 text-sm">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTasks.map((task) => {
                const assignedUser = users.find(u => u.id === task.assignedTo);
                const assignedByUser = users.find(u => u.id === task.assignedBy);
                const isOverdue = task.endDate && new Date(task.endDate) < new Date() && task.status !== 'completed';
                
                return (
                  <div key={task.id} className={`flex items-center justify-between p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-md ${
                    isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                  }`}>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-900 text-lg">{task.title}</h3>
                            {isOverdue && (
                              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">
                                OVERDUE
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                          <div className="flex items-center space-x-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(task.priority)}`}>
                              {task.priority.toUpperCase()}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(task.status)}`}>
                              {task.status.replace('-', ' ').toUpperCase()}
                            </span>
                            {task.tags && task.tags.length > 0 && (
                              <div className="flex space-x-1">
                                {task.tags.slice(0, 2).map(tag => (
                                  <span key={tag} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-6">
                          <div className="text-sm text-gray-500 mb-1">
                            Created: {new Date(task.createdAt).toLocaleDateString()}
                          </div>
                          {task.startedAt && (
                            <div className="text-sm text-blue-600 mb-1">
                              Started: {new Date(task.startedAt).toLocaleDateString()}
                            </div>
                          )}
                          {task.startDate && (
                            <div className="text-sm text-gray-500 mb-1">
                              Start: {new Date(task.startDate).toLocaleDateString()}
                            </div>
                          )}
                          {task.endDate && (
                            <div className={`text-sm mb-1 ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                              End: {new Date(task.endDate).toLocaleDateString()}
                            </div>
                          )}
                          {assignedUser && (
                            <div className="text-xs text-gray-400">
                              Assigned to: <span className="font-medium">{assignedUser.username}</span>
                            </div>
                          )}
                          {assignedByUser && (
                            <div className="text-xs text-gray-400">
                              By: <span className="font-medium">{assignedByUser.username}</span>
                            </div>
                          )}
                          {task.estimatedHours && (
                            <div className="text-xs text-gray-400 mt-1">
                              Est: {task.estimatedHours}h | Actual: {task.actualHours || 0}h
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