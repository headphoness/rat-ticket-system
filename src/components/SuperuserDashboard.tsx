import React, { useState } from 'react';
import { Plus, Users, BarChart3, Eye, TrendingUp, Building2, UserCheck, Activity, Calendar, Filter, Download, RefreshCw, Search, Edit, Trash2 } from 'lucide-react';
import { User, Team, Task } from '../types';
import { getUsers, getTeams, getTasks, saveUsers, saveTeams, getUserById, getNotifications, saveNotifications } from '../utils/storage';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import TeamDetailModal from './TeamDetailModal';

interface SuperuserDashboardProps {
  activeTab: string;
}

const SuperuserDashboard: React.FC<SuperuserDashboardProps> = ({ activeTab }) => {
  const [users, setUsers] = useState<User[]>(getUsers() || []);
  const [teams, setTeams] = useState<Team[]>(getTeams() || []);
  const [tasks] = useState<Task[]>(getTasks() || []);
  const [notifications, setNotifications] = useState(getNotifications() || []);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showTeamDetail, setShowTeamDetail] = useState(false);
  const [createNewAdmin, setCreateNewAdmin] = useState(false);

  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    department: '',
    adminId: '',
    newAdminUsername: '',
    newAdminEmail: '',
    newAdminPassword: ''
  });

  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'admin' as 'admin' | 'user',
    teamId: ''
  });

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeam.name || !newTeam.department) return;

    let adminId = newTeam.adminId;

    // Create new admin if needed
    if (createNewAdmin && newTeam.newAdminUsername && newTeam.newAdminEmail && newTeam.newAdminPassword) {
      const newAdmin: User = {
        id: Date.now().toString(),
        username: newTeam.newAdminUsername,
        email: newTeam.newAdminEmail,
        password: newTeam.newAdminPassword,
        role: 'admin',
        createdAt: new Date(),
        addedBy: '1' // superuser
      };

      const updatedUsers = [...users, newAdmin];
      setUsers(updatedUsers);
      saveUsers(updatedUsers);
      adminId = newAdmin.id;
    }

    if (!adminId) return;

    const team: Team = {
      id: Date.now().toString(),
      name: newTeam.name,
      description: newTeam.description,
      department: newTeam.department,
      adminIds: [adminId],
      memberIds: [adminId],
      createdAt: new Date(),
      createdBy: '1' // superuser
    };

    const updatedTeams = [...teams, team];
    setTeams(updatedTeams);
    saveTeams(updatedTeams);

    // Update admin's teamId
    const updatedUsers = users.map(user => 
      user.id === adminId ? { ...user, teamId: team.id } : user
    );
    setUsers(updatedUsers);
    saveUsers(updatedUsers);

    // Notify all existing admins about new team creation
    const existingAdmins = users.filter(u => u.role === 'admin' && u.id !== adminId);
    const newNotifications = existingAdmins.map(admin => ({
      id: `${Date.now()}-${admin.id}`,
      userId: admin.id,
      type: 'team_created' as const,
      message: `A new team "${newTeam.name}" has been created by superuser`,
      read: false,
      createdAt: new Date(),
      teamId: team.id
    }));

    const updatedNotifications = [...notifications, ...newNotifications];
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);

    setNewTeam({ name: '', description: '', department: '', adminId: '', newAdminUsername: '', newAdminEmail: '', newAdminPassword: '' });
    setCreateNewAdmin(false);
    setShowCreateTeam(false);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username || !newUser.email || !newUser.password) return;

    const user: User = {
      id: Date.now().toString(),
      username: newUser.username,
      email: newUser.email,
      password: newUser.password,
      role: newUser.role,
      teamId: newUser.teamId || undefined,
      createdAt: new Date(),
      lastLogin: new Date(),
      addedBy: '1' // superuser
    };

    const updatedUsers = [...users, user];
    setUsers(updatedUsers);
    saveUsers(updatedUsers);

    if (newUser.teamId) {
      const updatedTeams = teams.map(team =>
        team.id === newUser.teamId
          ? { ...team, memberIds: [...team.memberIds, user.id] }
          : team
      );
      setTeams(updatedTeams);
      saveTeams(updatedTeams);
    }

    setNewUser({ username: '', email: '', password: '', role: 'admin', teamId: '' });
    setShowCreateUser(false);
  };

  const handleViewTeamDetails = (team: Team) => {
    setSelectedTeam(team);
    setShowTeamDetail(true);
  };

  const getSystemMetrics = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
    const overdueTasks = tasks.filter(t => 
      t.endDate && new Date(t.endDate) < new Date() && t.status !== 'completed'
    ).length;
    
    return {
      totalUsers: users.length,
      totalTeams: teams.length,
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      activeUsers: users.filter(u => u.role !== 'superuser').length
    };
  };

  const getTeamPerformanceData = () => {
    return teams.map(team => {
      const teamTasks = tasks.filter(task => task.teamId === team.id);
      const completedTasks = teamTasks.filter(task => task.status === 'completed').length;
      const totalTasks = teamTasks.length;
      const performance = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      return {
        name: team.name,
        completed: completedTasks,
        total: totalTasks,
        inProgress: teamTasks.filter(t => t.status === 'in-progress').length,
        open: teamTasks.filter(t => t.status === 'open').length,
        performance: Math.round(performance),
        members: team.memberIds.length
      };
    });
  };

  const getTaskTrendData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayTasks = tasks.filter(task => 
        new Date(task.createdAt).toISOString().split('T')[0] === date
      );
      const completedTasks = tasks.filter(task => 
        task.completedAt && new Date(task.completedAt).toISOString().split('T')[0] === date
      );

      return {
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        created: dayTasks.length,
        completed: completedTasks.length
      };
    });
  };

  const getUserRoleDistribution = () => {
    const roleCount = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: 'Admins', value: roleCount.admin || 0, color: '#3B82F6' },
      { name: 'Users', value: roleCount.user || 0, color: '#10B981' },
      { name: 'Superusers', value: roleCount.superuser || 0, color: '#8B5CF6' }
    ];
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const metrics = getSystemMetrics();

  if (activeTab === 'teams') {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
            <p className="text-gray-600 mt-2">Manage teams and monitor their performance across the organization</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={() => setShowCreateTeam(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 flex items-center space-x-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Team</span>
            </button>
          </div>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Teams</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{teams.length}</p>
                <div className="flex items-center text-sm text-green-600 mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>+8% from last month</span>
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Active Members</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{users.filter(u => u.teamId).length}</p>
                <div className="flex items-center text-sm text-green-600 mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>+12% from last month</span>
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded-xl">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Avg Team Size</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {teams.length > 0 ? Math.round(users.filter(u => u.teamId).length / teams.length) : 0}
                </p>
                <div className="flex items-center text-sm text-blue-600 mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>Optimal size</span>
                </div>
              </div>
              <div className="bg-purple-50 p-3 rounded-xl">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Completion Rate</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.completionRate}%</p>
                <div className="flex items-center text-sm text-green-600 mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>+5% from last month</span>
                </div>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {showCreateTeam && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create New Team</h2>
              <button
                onClick={() => setShowCreateTeam(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateTeam} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Team Name *</label>
                  <input
                    type="text"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    placeholder="Enter team name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Department *</label>
                  <select
                    value={newTeam.department}
                    onChange={(e) => setNewTeam({ ...newTeam, department: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="QA">Quality Assurance</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  rows={3}
                  placeholder="Describe the team's purpose and responsibilities"
                />
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center space-x-4 mb-4">
                  <button
                    type="button"
                    onClick={() => setCreateNewAdmin(false)}
                    className={`px-4 py-2 rounded-lg transition-colors ${!createNewAdmin ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}
                  >
                    Select Existing Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateNewAdmin(true)}
                    className={`px-4 py-2 rounded-lg transition-colors ${createNewAdmin ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}
                  >
                    Create New Admin
                  </button>
                </div>

                {!createNewAdmin ? (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Select Admin</label>
                    <select
                      value={newTeam.adminId}
                      onChange={(e) => setNewTeam({ ...newTeam, adminId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                      required={!createNewAdmin}
                    >
                      <option value="">Select Admin</option>
                      {users.filter(user => user.role === 'admin' && !user.teamId).map(user => (
                        <option key={user.id} value={user.id}>{user.username} ({user.email})</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Username *</label>
                      <input
                        type="text"
                        value={newTeam.newAdminUsername}
                        onChange={(e) => setNewTeam({ ...newTeam, newAdminUsername: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                        placeholder="Enter username"
                        required={createNewAdmin}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        value={newTeam.newAdminEmail}
                        onChange={(e) => setNewTeam({ ...newTeam, newAdminEmail: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                        placeholder="Enter email"
                        required={createNewAdmin}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
                      <input
                        type="password"
                        value={newTeam.newAdminPassword}
                        onChange={(e) => setNewTeam({ ...newTeam, newAdminPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                        placeholder="Enter password"
                        required={createNewAdmin}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCreateTeam(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Teams Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTeams.map(team => {
            const admins = team.adminIds.map(id => getUserById(id)).filter(Boolean);
            const members = team.memberIds.map(id => getUserById(id)).filter(Boolean);
            const teamTasks = tasks.filter(task => task.teamId === team.id);
            const completedTasks = teamTasks.filter(task => task.status === 'completed').length;
            const performance = teamTasks.length > 0 ? Math.round((completedTasks / teamTasks.length) * 100) : 0;
            const overdueTasks = teamTasks.filter(task => 
              task.endDate && new Date(task.endDate) < new Date() && task.status !== 'completed'
            ).length;
            const createdByUser = getUserById(team.createdBy);

            return (
              <div key={team.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{team.name}</h3>
                      <p className="text-sm text-gray-500">{team.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${performance >= 80 ? 'bg-green-400' : performance >= 60 ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
                    <span className="text-xs text-gray-500">
                      {performance >= 80 ? 'Excellent' : performance >= 60 ? 'Good' : 'Needs Attention'}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6 line-clamp-2">{team.description}</p>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{members.length}</div>
                      <div className="text-xs text-blue-600">Members</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{teamTasks.length}</div>
                      <div className="text-xs text-green-600">Tasks</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Performance</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            performance >= 80 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                            performance >= 60 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                            'bg-gradient-to-r from-red-400 to-red-600'
                          }`}
                          style={{ width: `${performance}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{performance}%</span>
                    </div>
                  </div>

                  {overdueTasks > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm text-red-800 font-medium">{overdueTasks} overdue tasks</span>
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 space-y-1">
                    <div>
                      Admin: <span className="font-medium text-gray-700">
                        {admins.map(admin => admin?.username).join(', ')}
                      </span>
                    </div>
                    <div>
                      Created: <span className="font-medium text-gray-700">{new Date(team.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div>
                      By: <span className="font-medium text-gray-700">{createdByUser?.username}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <button 
                    onClick={() => handleViewTeamDetails(team)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Team Detail Modal */}
        {selectedTeam && (
          <TeamDetailModal
            team={selectedTeam}
            isOpen={showTeamDetail}
            onClose={() => {
              setShowTeamDetail(false);
              setSelectedTeam(null);
            }}
          />
        )}
      </div>
    );
  }

  if (activeTab === 'users') {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-2">Manage user accounts and monitor their activity across the platform</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                <option>All Roles</option>
                <option>Admin</option>
                <option>User</option>
              </select>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={() => setShowCreateUser(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 flex items-center space-x-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add User</span>
            </button>
          </div>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{users.length}</p>
                <div className="flex items-center text-sm text-green-600 mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>+15% from last month</span>
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Active Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{users.filter(u => u.role !== 'superuser').length}</p>
                <div className="flex items-center text-sm text-green-600 mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>+8% from last month</span>
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded-xl">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Team Members</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{users.filter(u => u.teamId).length}</p>
                <div className="flex items-center text-sm text-blue-600 mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>+12% from last month</span>
                </div>
              </div>
              <div className="bg-purple-50 p-3 rounded-xl">
                <UserCheck className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">New This Month</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {users.filter(u => {
                    const userDate = new Date(u.createdAt);
                    const now = new Date();
                    return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
                <div className="flex items-center text-sm text-green-600 mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>+25% from last month</span>
                </div>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl">
                <Calendar className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {showCreateUser && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add New User</h2>
              <button
                onClick={() => setShowCreateUser(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Username *</label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    placeholder="Enter username"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    placeholder="Enter password"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'admin' | 'user' })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  >
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Team Assignment</label>
                  <select
                    value={newUser.teamId}
                    onChange={(e) => setNewUser({ ...newUser, teamId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  >
                    <option value="">No Team</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCreateUser(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">All Users ({filteredUsers.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Team</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tasks</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Performance</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Added By</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map(user => {
                  const team = teams.find(t => t.id === user.teamId);
                  const userTasks = tasks.filter(t => t.assignedTo === user.id);
                  const completedTasks = userTasks.filter(t => t.status === 'completed').length;
                  const performance = userTasks.length > 0 ? Math.round((completedTasks / userTasks.length) * 100) : 0;
                  const addedByUser = getUserById(user.addedBy || '');

                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">{user.username}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                          user.role === 'superuser' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                          user.role === 'admin' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          'bg-green-100 text-green-800 border-green-200'
                        }`}>
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {team ? (
                          <div className="flex items-center space-x-2">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <span>{team.name}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">No Team</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-semibold">{userTasks.length}</div>
                        <div className="text-xs text-gray-500">{completedTasks} completed</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                performance >= 80 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                                performance >= 60 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                                'bg-gradient-to-r from-red-400 to-red-600'
                              }`}
                              style={{ width: `${performance}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-600">{performance}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {addedByUser?.username || 'System'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-indigo-600 hover:text-indigo-900 transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'analytics') {
    const teamPerformanceData = getTeamPerformanceData();
    const taskTrendData = getTaskTrendData();
    const userRoleData = getUserRoleDistribution();

    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Comprehensive insights and performance metrics across the platform</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <select 
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all">
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Tasks</p>
                <p className="text-3xl font-bold mt-2">{metrics.totalTasks}</p>
                <p className="text-blue-100 text-sm mt-1">+12% from last month</p>
              </div>
              <div className="bg-blue-400/30 p-3 rounded-xl">
                <BarChart3 className="w-6 h-6" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Completion Rate</p>
                <p className="text-3xl font-bold mt-2">{metrics.completionRate}%</p>
                <p className="text-green-100 text-sm mt-1">+5% from last month</p>
              </div>
              <div className="bg-green-400/30 p-3 rounded-xl">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Active Teams</p>
                <p className="text-3xl font-bold mt-2">{metrics.totalTeams}</p>
                <p className="text-purple-100 text-sm mt-1">+2 new teams</p>
              </div>
              <div className="bg-purple-400/30 p-3 rounded-xl">
                <Building2 className="w-6 h-6" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Active Users</p>
                <p className="text-3xl font-bold mt-2">{metrics.activeUsers}</p>
                <p className="text-orange-100 text-sm mt-1">+8% engagement</p>
              </div>
              <div className="bg-orange-400/30 p-3 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Team Performance Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Team Performance</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Completed</span>
                <div className="w-3 h-3 bg-gray-300 rounded-full ml-4"></div>
                <span>Total</span>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamPerformanceData}>
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
                  <Bar dataKey="completed" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="total" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Task Trend Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Task Trends</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                <span>Created</span>
                <div className="w-3 h-3 bg-green-500 rounded-full ml-4"></div>
                <span>Completed</span>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={taskTrendData}>
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
                  <Area type="monotone" dataKey="created" stackId="1" stroke="#6366F1" fill="#6366F1" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="completed" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* User Role Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">User Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userRoleData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {userRoleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Performance Summary</h3>
            <div className="space-y-6">
              {teamPerformanceData.slice(0, 4).map((team, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{team.name}</div>
                      <div className="text-sm text-gray-500">{team.members} members</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{team.performance}%</div>
                    <div className="text-sm text-gray-500">{team.completed}/{team.total} tasks</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default SuperuserDashboard;