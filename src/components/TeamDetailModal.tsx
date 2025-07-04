import React from 'react';
import { X, User, Clock, CheckCircle, AlertTriangle, Target, TrendingUp, Calendar, Award } from 'lucide-react';
import { TeamDetailModalProps } from '../types';
import { getTasks, getUsers } from '../utils/storage';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const TeamDetailModal: React.FC<TeamDetailModalProps> = ({ team, isOpen, onClose }) => {
  if (!isOpen) return null;

  const tasks = getTasks();
  const users = getUsers();
  
  const teamMembers = team.memberIds.map(id => users.find(u => u.id === id)).filter(Boolean);
  const teamTasks = tasks.filter(task => task.teamId === team.id);
  
  const getMemberPerformance = () => {
    return teamMembers.map(member => {
      const memberTasks = teamTasks.filter(task => task.assignedTo === member!.id);
      const completedTasks = memberTasks.filter(task => task.status === 'completed').length;
      const inProgressTasks = memberTasks.filter(task => task.status === 'in-progress').length;
      const openTasks = memberTasks.filter(task => task.status === 'open').length;
      const overdueTasks = memberTasks.filter(task => 
        task.endDate && new Date(task.endDate) < new Date() && task.status !== 'completed'
      ).length;
      
      const performance = memberTasks.length > 0 ? Math.round((completedTasks / memberTasks.length) * 100) : 0;
      
      return {
        member,
        totalTasks: memberTasks.length,
        completedTasks,
        inProgressTasks,
        openTasks,
        overdueTasks,
        performance,
        estimatedHours: memberTasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0),
        actualHours: memberTasks.reduce((sum, task) => sum + (task.actualHours || 0), 0)
      };
    });
  };

  const getTeamStats = () => {
    const totalTasks = teamTasks.length;
    const completedTasks = teamTasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = teamTasks.filter(t => t.status === 'in-progress').length;
    const overdueTasks = teamTasks.filter(t => 
      t.endDate && new Date(t.endDate) < new Date() && t.status !== 'completed'
    ).length;
    
    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      totalEstimatedHours: teamTasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0),
      totalActualHours: teamTasks.reduce((sum, task) => sum + (task.actualHours || 0), 0)
    };
  };

  const getTaskDistribution = () => {
    const priorityCount = teamTasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: 'Urgent', value: priorityCount.urgent || 0, color: '#EF4444' },
      { name: 'High', value: priorityCount.high || 0, color: '#F97316' },
      { name: 'Medium', value: priorityCount.medium || 0, color: '#EAB308' },
      { name: 'Low', value: priorityCount.low || 0, color: '#22C55E' }
    ];
  };

  const memberPerformance = getMemberPerformance();
  const teamStats = getTeamStats();
  const taskDistribution = getTaskDistribution();
  const admins = team.adminIds.map(id => users.find(u => u.id === id)).filter(Boolean);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">{team.name}</h2>
              <p className="text-indigo-100 text-lg mb-4">{team.description}</p>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Admin: {admins.map(admin => admin?.username).join(', ')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Created: {new Date(team.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>Department: {team.department}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-8">
          {/* Team Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Total Tasks</p>
                  <p className="text-3xl font-bold text-blue-900 mt-2">{teamStats.totalTasks}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-green-50 rounded-xl p-6 border border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-green-600 uppercase tracking-wide">Completed</p>
                  <p className="text-3xl font-bold text-green-900 mt-2">{teamStats.completedTasks}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-yellow-600 uppercase tracking-wide">In Progress</p>
                  <p className="text-3xl font-bold text-yellow-900 mt-2">{teamStats.inProgressTasks}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-xl">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
            <div className="bg-red-50 rounded-xl p-6 border border-red-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-red-600 uppercase tracking-wide">Overdue</p>
                  <p className="text-3xl font-bold text-red-900 mt-2">{teamStats.overdueTasks}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Member Performance Chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Member Performance</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={memberPerformance.map(mp => ({
                    name: mp.member?.username,
                    completed: mp.completedTasks,
                    total: mp.totalTasks,
                    performance: mp.performance
                  }))}>
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
                </ResponsiveContainer>
              </div>
            </div>

            {/* Task Priority Distribution */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Task Priority Distribution</h3>
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

          {/* Team Members Detailed Performance */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Team Members Performance</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {memberPerformance.map((mp, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {mp.member?.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">{mp.member?.username}</h4>
                        <p className="text-sm text-gray-500">{mp.member?.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            mp.member?.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {mp.member?.role?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{mp.totalTasks}</div>
                        <div className="text-sm text-gray-500">Total Tasks</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{mp.completedTasks}</div>
                        <div className="text-sm text-gray-500">Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{mp.inProgressTasks}</div>
                        <div className="text-sm text-gray-500">In Progress</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{mp.overdueTasks}</div>
                        <div className="text-sm text-gray-500">Overdue</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Performance Rate</span>
                        <span className="font-semibold text-gray-900">{mp.performance}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${mp.performance}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Time Tracking</span>
                        <span className="text-gray-900">
                          {mp.actualHours}h / {mp.estimatedHours}h
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Efficiency</span>
                        <span className={`font-semibold ${
                          mp.estimatedHours > 0 && mp.actualHours <= mp.estimatedHours 
                            ? 'text-green-600' 
                            : 'text-orange-600'
                        }`}>
                          {mp.estimatedHours > 0 
                            ? `${Math.round((mp.estimatedHours / Math.max(mp.actualHours, 1)) * 100)}%`
                            : 'N/A'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Team Summary */}
          <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-bold text-indigo-900 mb-2">Team Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-indigo-600 font-medium">Completion Rate:</span>
                    <span className="ml-2 font-bold text-indigo-900">{teamStats.completionRate}%</span>
                  </div>
                  <div>
                    <span className="text-indigo-600 font-medium">Total Hours:</span>
                    <span className="ml-2 font-bold text-indigo-900">{teamStats.totalActualHours}h</span>
                  </div>
                  <div>
                    <span className="text-indigo-600 font-medium">Team Size:</span>
                    <span className="ml-2 font-bold text-indigo-900">{teamMembers.length} members</span>
                  </div>
                  <div>
                    <span className="text-indigo-600 font-medium">Department:</span>
                    <span className="ml-2 font-bold text-indigo-900">{team.department}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-indigo-900">{teamStats.completionRate}%</div>
                <div className="text-sm text-indigo-600">Overall Performance</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDetailModal;