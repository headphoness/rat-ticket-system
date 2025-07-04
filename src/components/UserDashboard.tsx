import React, { useState } from 'react';
import { CheckSquare, Clock, User, Bell, Calendar, Target, TrendingUp, Award, AlertTriangle, Play, CheckCircle, Search, Filter, SlidersHorizontal, CalendarDays } from 'lucide-react';
import { Task, User as UserType, Notification } from '../types';
import { getTasks, getUsers, saveTasks, getNotifications, saveNotifications } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface UserDashboardProps {
  activeTab: string;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ activeTab }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>(getTasks());
  const [notifications, setNotifications] = useState<Notification[]>(getNotifications());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const users = getUsers();

  const myTasks = tasks.filter(task => task.assignedTo === user?.id);
  const userNotifications = notifications.filter(n => n.userId === user?.id && !n.read);

  const filteredTasks = myTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleMarkComplete = (taskId: string) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId && task.assignedTo === user?.id) {
        const updatedTask = { ...task, status: 'completed' as const, completedAt: new Date() };
        
        // Notify admin and superuser about task completion
        const assignedByUser = users.find(u => u.id === task.assignedBy);
        const superuser = users.find(u => u.role === 'superuser');
        
        const newNotifications: Notification[] = [];
        
        // Notify admin
        if (assignedByUser) {
          newNotifications.push({
            id: `${Date.now()}-admin`,
            userId: assignedByUser.id,
            type: 'task_completed',
            message: `${user?.username} completed the task: ${task.title}`,
            read: false,
            createdAt: new Date(),
            taskId: taskId
          });
        }
        
        // Notify superuser
        if (superuser) {
          newNotifications.push({
            id: `${Date.now()}-super`,
            userId: superuser.id,
            type: 'task_completed',
            message: `${user?.username} completed the task: ${task.title}`,
            read: false,
            createdAt: new Date(),
            taskId: taskId
          });
        }

        const updatedNotifications = [...notifications, ...newNotifications];
        saveNotifications(updatedNotifications);
        setNotifications(updatedNotifications);

        return updatedTask;
      }
      return task;
    });

    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const handleMarkInProgress = (taskId: string) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId && task.assignedTo === user?.id) {
        const updatedTask = { 
          ...task, 
          status: 'in-progress' as const,
          startedAt: new Date()
        };
        
        // Notify admin and superuser that user started working
        const assignedByUser = users.find(u => u.id === task.assignedBy);
        const superuser = users.find(u => u.role === 'superuser');
        
        const newNotifications: Notification[] = [];
        
        // Notify admin
        if (assignedByUser) {
          newNotifications.push({
            id: `${Date.now()}-admin-start`,
            userId: assignedByUser.id,
            type: 'task_started',
            message: `${user?.username} started working on "${task.title}"`,
            read: false,
            createdAt: new Date(),
            taskId: taskId
          });
        }
        
        // Notify superuser
        if (superuser) {
          newNotifications.push({
            id: `${Date.now()}-super-start`,
            userId: superuser.id,
            type: 'task_started',
            message: `${user?.username} started working on "${task.title}"`,
            read: false,
            createdAt: new Date(),
            taskId: taskId
          });
        }

        const updatedNotifications = [...notifications, ...newNotifications];
        saveNotifications(updatedNotifications);
        setNotifications(updatedNotifications);
        
        return updatedTask;
      }
      return task;
    });
    
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const getMyMetrics = () => {
    const totalTasks = myTasks.length;
    const completedTasks = myTasks.filter(task => task.status === 'completed').length;
    const inProgressTasks = myTasks.filter(task => task.status === 'in-progress').length;
    const openTasks = myTasks.filter(task => task.status === 'open').length;
    const overdueTasks = myTasks.filter(task => 
      task.endDate && new Date(task.endDate) < new Date() && task.status !== 'completed'
    ).length;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      openTasks,
      overdueTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
  };

  const getPerformanceData = () => {
    const completedTasks = myTasks.filter(task => task.status === 'completed').length;
    const inProgressTasks = myTasks.filter(task => task.status === 'in-progress').length;
    const openTasks = myTasks.filter(task => task.status === 'open').length;

    return [
      { name: 'Completed', value: completedTasks, color: '#10B981' },
      { name: 'In Progress', value: inProgressTasks, color: '#3B82F6' },
      { name: 'Open', value: openTasks, color: '#EF4444' }
    ];
  };

  const getMonthlyPerformance = () => {
    const monthlyData: { [key: string]: { completed: number; total: number } } = {};
    
    myTasks.forEach(task => {
      const month = new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (!monthlyData[month]) {
        monthlyData[month] = { completed: 0, total: 0 };
      }
      monthlyData[month].total++;
      if (task.status === 'completed') {
        monthlyData[month].completed++;
      }
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      completed: data.completed,
      total: data.total,
      performance: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
    }));
  };

  const getWeeklyTrend = () => {
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
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        completed: completedTasks.length
      };
    });
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

  const metrics = getMyMetrics();

  if (activeTab === 'my-tasks') {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
            <p className="text-gray-600 mt-2">Manage your assigned tasks and track your progress</p>
            {userNotifications.length > 0 && (
              <div className="flex items-center mt-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <Bell className="w-4 h-4 mr-2 text-blue-600" />
                <span className="text-sm text-blue-800 font-medium">{userNotifications.length} new notifications</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <div className="text-right">
              <div className="text-sm text-gray-500">Completion Rate</div>
              <div className="text-2xl font-bold text-indigo-600">{metrics.completionRate}%</div>
            </div>
          </div>
        </div>

        {/* Task Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.totalTasks}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Completed</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{metrics.completedTasks}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-xl">
                <Award className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">In Progress</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{metrics.inProgressTasks}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Overdue</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{metrics.overdueTasks}</p>
              </div>
              <div className="bg-red-50 p-3 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {userNotifications.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-bold text-blue-900 mb-4 flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Recent Notifications
            </h3>
            <div className="space-y-3">
              {userNotifications.slice(0, 3).map(notification => (
                <div key={notification.id} className="bg-white rounded-lg p-4 border border-blue-100">
                  <p className="text-sm text-blue-800 font-medium">{notification.message}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Professional Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="all">All Priority</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                
                <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <SlidersHorizontal className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">My Task List</h2>
              <span className="text-sm text-gray-500">{filteredTasks.length} tasks found</span>
            </div>
          </div>
          <div className="p-6">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTasks
                  .sort((a, b) => {
                    // Sort by status priority: open -> in-progress -> completed
                    const statusOrder = { 'open': 0, 'in-progress': 1, 'completed': 2 };
                    return statusOrder[a.status] - statusOrder[b.status];
                  })
                  .map(task => {
                    const assignedByUser = users.find(u => u.id === task.assignedBy);
                    const isOverdue = task.endDate && new Date(task.endDate) < new Date() && task.status !== 'completed';
                    
                    return (
                      <div key={task.id} className={`border rounded-xl p-6 transition-all hover:shadow-md ${
                        isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="font-bold text-gray-900 text-lg mb-1">{task.title}</h3>
                                <p className="text-gray-600 mb-3 leading-relaxed">{task.description}</p>
                              </div>
                              {isOverdue && (
                                <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold border border-red-200">
                                  OVERDUE
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-4 mb-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(task.priority)}`}>
                                {task.priority.toUpperCase()}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(task.status)}`}>
                                {task.status.replace('-', ' ').toUpperCase()}
                              </span>
                              {assignedByUser && (
                                <span className="text-xs text-gray-500 flex items-center">
                                  <User className="w-3 h-3 mr-1" />
                                  Assigned by: <span className="font-medium ml-1">{assignedByUser.username}</span>
                                </span>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                Created: {new Date(task.createdAt).toLocaleDateString()}
                              </div>
                              {task.startedAt && (
                                <div className="flex items-center text-blue-600">
                                  <Play className="w-4 h-4 mr-1" />
                                  Started: {new Date(task.startedAt).toLocaleDateString()}
                                </div>
                              )}
                              {task.startDate && (
                                <div className="flex items-center">
                                  <CalendarDays className="w-4 h-4 mr-1" />
                                  Start: {new Date(task.startDate).toLocaleDateString()}
                                </div>
                              )}
                              {task.endDate && (
                                <div className={`flex items-center ${isOverdue ? 'text-red-600 font-semibold' : ''}`}>
                                  <Clock className="w-4 h-4 mr-1" />
                                  End: {new Date(task.endDate).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                {task.estimatedHours && (
                                  <div>Est: {task.estimatedHours}h</div>
                                )}
                                {task.actualHours && (
                                  <div>Actual: {task.actualHours}h</div>
                                )}
                              </div>
                              
                              <div className="flex space-x-2">
                                {task.status === 'open' && (
                                  <button
                                    onClick={() => handleMarkInProgress(task.id)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center space-x-2"
                                  >
                                    <Play className="w-4 h-4" />
                                    <span>Start Task</span>
                                  </button>
                                )}
                                {task.status === 'in-progress' && (
                                  <button
                                    onClick={() => handleMarkComplete(task.id)}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center space-x-2"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Mark Complete</span>
                                  </button>
                                )}
                                {task.status === 'completed' && (
                                  <div className="flex items-center space-x-2 text-green-600 font-semibold">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Completed</span>
                                  </div>
                                )}
                              </div>
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
  }

  if (activeTab === 'my-performance') {
    const performanceData = getPerformanceData();
    const monthlyData = getMonthlyPerformance();
    const weeklyTrend = getWeeklyTrend();

    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Performance</h1>
            <p className="text-gray-600 mt-2">Track your productivity and task completion metrics</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>All time</option>
            </select>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-8 text-white">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{metrics.completionRate}%</div>
              <div className="text-indigo-100">Completion Rate</div>
              <div className="w-full bg-indigo-400/30 rounded-full h-2 mt-3">
                <div
                  className="bg-white h-2 rounded-full transition-all duration-300"
                  style={{ width: `${metrics.completionRate}%` }}
                ></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{metrics.totalTasks}</div>
              <div className="text-indigo-100">Total Tasks</div>
              <div className="text-sm text-indigo-200 mt-1">All time</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{metrics.completedTasks}</div>
              <div className="text-indigo-100">Completed</div>
              <div className="text-sm text-indigo-200 mt-1">Successfully finished</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{metrics.inProgressTasks}</div>
              <div className="text-indigo-100">In Progress</div>
              <div className="text-sm text-indigo-200 mt-1">Currently working</div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Task Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Task Status Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={performanceData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {performanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly Completion Trend */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Weekly Completion Trend</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
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
                    stroke="#10B981" 
                    strokeWidth={3} 
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Performance */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Monthly Performance</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
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
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Performance Insights</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-green-900">Great Progress!</div>
                    <div className="text-sm text-green-700">You've completed {metrics.completedTasks} tasks</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-600">{metrics.completionRate}%</div>
              </div>

              {metrics.overdueTasks > 0 && (
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-red-900">Attention Needed</div>
                      <div className="text-sm text-red-700">You have {metrics.overdueTasks} overdue tasks</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-red-600">{metrics.overdueTasks}</div>
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-blue-900">In Progress</div>
                    <div className="text-sm text-blue-700">Currently working on {metrics.inProgressTasks} tasks</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-600">{metrics.inProgressTasks}</div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Pending Tasks</div>
                    <div className="text-sm text-gray-700">{metrics.openTasks} tasks waiting to be started</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-600">{metrics.openTasks}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {myTasks
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 5)
              .map(task => {
                const assignedByUser = users.find(u => u.id === task.assignedBy);
                
                return (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        task.status === 'completed' ? 'bg-green-100' :
                        task.status === 'in-progress' ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        {task.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : task.status === 'in-progress' ? (
                          <Clock className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Target className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{task.title}</h4>
                        <p className="text-sm text-gray-600">
                          Assigned by {assignedByUser?.username} on {new Date(task.createdAt).toLocaleDateString()}
                          {task.startedAt && (
                            <span className="text-blue-600 ml-2">
                              • Started on {new Date(task.startedAt).toLocaleDateString()}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(task.status)}`}>
                      {task.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default UserDashboard;