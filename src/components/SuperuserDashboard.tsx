import React, { useState } from 'react';
import { Plus, Users, Building2, Search, Filter, Edit, Trash2, Eye, UserPlus, Calendar, MapPin, DollarSign, Mail, Phone, User, Shield } from 'lucide-react';
import { User as UserType, Team, CreateUserFormData, CreateTeamFormData } from '../types';
import { getUsers, getTeams, saveUsers, saveTeams, generateId, createNotification, getNotifications, saveNotifications } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';

interface SuperuserDashboardProps {
  activeTab: string;
}

const SuperuserDashboard: React.FC<SuperuserDashboardProps> = ({ activeTab }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserType[]>(getUsers());
  const [teams, setTeams] = useState<Team[]>(getTeams());
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  const [userFormData, setUserFormData] = useState<CreateUserFormData>({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'user',
    department: '',
    position: '',
    teamId: '',
    password: '',
    confirmPassword: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  });

  const [teamFormData, setTeamFormData] = useState<CreateTeamFormData>({
    name: '',
    description: '',
    department: '',
    adminUsername: '',
    adminPassword: '',
    adminEmail: '',
    adminFirstName: '',
    adminLastName: '',
    budget: 0,
    location: ''
  });

  const handleCreateUser = () => {
    if (userFormData.password !== userFormData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const newUser: UserType = {
      id: generateId(),
      username: userFormData.username,
      email: userFormData.email,
      firstName: userFormData.firstName,
      lastName: userFormData.lastName,
      phone: userFormData.phone,
      role: userFormData.role,
      department: userFormData.department,
      position: userFormData.position,
      teamId: userFormData.teamId || undefined,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      password: userFormData.password,
      addedBy: user?.id,
      address: userFormData.address,
      emergencyContact: userFormData.emergencyContact,
      permissions: userFormData.role === 'admin' ? ['team_management', 'ticket_management'] : ['ticket_create', 'ticket_update']
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    saveUsers(updatedUsers);

    // Create notification for team admin if user is assigned to a team
    if (newUser.teamId) {
      const team = teams.find(t => t.id === newUser.teamId);
      if (team) {
        const notifications = getNotifications();
        team.adminIds.forEach(adminId => {
          const notification = createNotification(
            adminId,
            'user_added',
            'New Team Member Added',
            `${newUser.firstName} ${newUser.lastName} has been added to your team`,
            'medium',
            undefined,
            team.id
          );
          notifications.push(notification);
        });
        saveNotifications(notifications);
      }
    }

    setShowCreateUserModal(false);
    resetUserForm();
  };

  const handleCreateTeam = () => {
    const teamId = generateId();
    let adminId = '';

    // Create admin user if provided
    if (teamFormData.adminUsername) {
      const newAdmin: UserType = {
        id: generateId(),
        username: teamFormData.adminUsername,
        email: teamFormData.adminEmail || '',
        firstName: teamFormData.adminFirstName || '',
        lastName: teamFormData.adminLastName || '',
        phone: '',
        role: 'admin',
        department: teamFormData.department,
        position: 'Team Admin',
        teamId: teamId,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        password: teamFormData.adminPassword || 'password',
        addedBy: user?.id,
        permissions: ['team_management', 'ticket_management'],
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        emergencyContact: {
          name: '',
          phone: '',
          relationship: ''
        }
      };

      adminId = newAdmin.id;
      const updatedUsers = [...users, newAdmin];
      setUsers(updatedUsers);
      saveUsers(updatedUsers);
    }

    const newTeam: Team = {
      id: teamId,
      name: teamFormData.name,
      description: teamFormData.description,
      department: teamFormData.department,
      adminIds: adminId ? [adminId] : [],
      memberIds: adminId ? [adminId] : [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: user?.id || '',
      status: 'active',
      budget: teamFormData.budget,
      location: teamFormData.location
    };

    const updatedTeams = [...teams, newTeam];
    setTeams(updatedTeams);
    saveTeams(updatedTeams);

    // Notify all admins about new team creation
    const notifications = getNotifications();
    users.filter(u => u.role === 'admin').forEach(admin => {
      const notification = createNotification(
        admin.id,
        'team_created',
        'New Team Created',
        `A new team "${newTeam.name}" has been created`,
        'medium',
        undefined,
        newTeam.id
      );
      notifications.push(notification);
    });
    saveNotifications(notifications);

    setShowCreateTeamModal(false);
    resetTeamForm();
  };

  const resetUserForm = () => {
    setUserFormData({
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: 'user',
      department: '',
      position: '',
      teamId: '',
      password: '',
      confirmPassword: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      },
      emergencyContact: {
        name: '',
        phone: '',
        relationship: ''
      }
    });
  };

  const resetTeamForm = () => {
    setTeamFormData({
      name: '',
      description: '',
      department: '',
      adminUsername: '',
      adminPassword: '',
      adminEmail: '',
      adminFirstName: '',
      adminLastName: '',
      budget: 0,
      location: ''
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const filteredTeams = teams.filter(team => {
    return team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           team.department.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (activeTab === 'users') {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-2">Manage all users across the organization</p>
          </div>
          <button
            onClick={() => setShowCreateUserModal(true)}
            className="mt-4 lg:mt-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
          >
            <UserPlus className="w-5 h-5" />
            <span>Add New User</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
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
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
                
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="all">All Roles</option>
                  <option value="superuser">Superuser</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map(user => {
            const team = teams.find(t => t.id === user.teamId);
            return (
              <div key={user.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{user.firstName} {user.lastName}</h3>
                      <p className="text-sm text-gray-500">@{user.username}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    user.status === 'active' ? 'bg-green-100 text-green-800' :
                    user.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {user.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    {user.email}
                  </div>
                  {user.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      {user.phone}
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <Shield className="w-4 h-4 mr-2" />
                    {user.role}
                  </div>
                  {user.department && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Building2 className="w-4 h-4 mr-2" />
                      {user.department}
                    </div>
                  )}
                  {team && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      {team.name}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Create User Modal */}
        {showCreateUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Add New User</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                      <input
                        type="text"
                        value={userFormData.username}
                        onChange={(e) => setUserFormData({...userFormData, username: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={userFormData.email}
                        onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        <input
                          type="text"
                          value={userFormData.firstName}
                          onChange={(e) => setUserFormData({...userFormData, firstName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        <input
                          type="text"
                          value={userFormData.lastName}
                          onChange={(e) => setUserFormData({...userFormData, lastName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={userFormData.phone}
                        onChange={(e) => setUserFormData({...userFormData, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Work Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Work Information</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                      <select
                        value={userFormData.role}
                        onChange={(e) => setUserFormData({...userFormData, role: e.target.value as 'admin' | 'user'})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                      <input
                        type="text"
                        value={userFormData.department}
                        onChange={(e) => setUserFormData({...userFormData, department: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                      <input
                        type="text"
                        value={userFormData.position}
                        onChange={(e) => setUserFormData({...userFormData, position: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Team</label>
                      <select
                        value={userFormData.teamId}
                        onChange={(e) => setUserFormData({...userFormData, teamId: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="">No Team</option>
                        {teams.map(team => (
                          <option key={team.id} value={team.id}>{team.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <input
                          type="password"
                          value={userFormData.password}
                          onChange={(e) => setUserFormData({...userFormData, password: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                        <input
                          type="password"
                          value={userFormData.confirmPassword}
                          onChange={(e) => setUserFormData({...userFormData, confirmPassword: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                      <input
                        type="text"
                        value={userFormData.address.street}
                        onChange={(e) => setUserFormData({...userFormData, address: {...userFormData.address, street: e.target.value}})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        value={userFormData.address.city}
                        onChange={(e) => setUserFormData({...userFormData, address: {...userFormData.address, city: e.target.value}})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                      <input
                        type="text"
                        value={userFormData.address.state}
                        onChange={(e) => setUserFormData({...userFormData, address: {...userFormData.address, state: e.target.value}})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                      <input
                        type="text"
                        value={userFormData.address.zipCode}
                        onChange={(e) => setUserFormData({...userFormData, address: {...userFormData.address, zipCode: e.target.value}})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                      <input
                        type="text"
                        value={userFormData.address.country}
                        onChange={(e) => setUserFormData({...userFormData, address: {...userFormData.address, country: e.target.value}})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        value={userFormData.emergencyContact.name}
                        onChange={(e) => setUserFormData({...userFormData, emergencyContact: {...userFormData.emergencyContact, name: e.target.value}})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={userFormData.emergencyContact.phone}
                        onChange={(e) => setUserFormData({...userFormData, emergencyContact: {...userFormData.emergencyContact, phone: e.target.value}})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                      <input
                        type="text"
                        value={userFormData.emergencyContact.relationship}
                        onChange={(e) => setUserFormData({...userFormData, emergencyContact: {...userFormData.emergencyContact, relationship: e.target.value}})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
                <button
                  onClick={() => setShowCreateUserModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateUser}
                  className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                >
                  Create User
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (activeTab === 'teams') {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
            <p className="text-gray-600 mt-2">Manage teams and their members</p>
          </div>
          <button
            onClick={() => setShowCreateTeamModal(true)}
            className="mt-4 lg:mt-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Team</span>
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            />
          </div>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map(team => {
            const admins = team.adminIds.map(id => users.find(u => u.id === id)).filter(Boolean);
            const memberCount = team.memberIds.length;
            
            return (
              <div key={team.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{team.name}</h3>
                      <p className="text-sm text-gray-500">{team.department}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    team.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {team.status}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4">{team.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    {memberCount} members
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Shield className="w-4 h-4 mr-2" />
                    Admin: {admins.map(admin => `${admin?.firstName} ${admin?.lastName}`).join(', ') || 'No admin assigned'}
                  </div>
                  {team.location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {team.location}
                    </div>
                  )}
                  {team.budget && (
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 mr-2" />
                      ${team.budget.toLocaleString()}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    Created {new Date(team.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Create Team Modal */}
        {showCreateTeamModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Create New Team</h2>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {/* Team Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Information</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Team Name</label>
                        <input
                          type="text"
                          value={teamFormData.name}
                          onChange={(e) => setTeamFormData({...teamFormData, name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                        <input
                          type="text"
                          value={teamFormData.department}
                          onChange={(e) => setTeamFormData({...teamFormData, department: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                          value={teamFormData.description}
                          onChange={(e) => setTeamFormData({...teamFormData, description: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          rows={3}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
                          <input
                            type="number"
                            value={teamFormData.budget}
                            onChange={(e) => setTeamFormData({...teamFormData, budget: Number(e.target.value)})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                          <input
                            type="text"
                            value={teamFormData.location}
                            onChange={(e) => setTeamFormData({...teamFormData, location: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Admin Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Admin (Optional)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Admin Username</label>
                        <input
                          type="text"
                          value={teamFormData.adminUsername}
                          onChange={(e) => setTeamFormData({...teamFormData, adminUsername: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Admin Password</label>
                        <input
                          type="password"
                          value={teamFormData.adminPassword}
                          onChange={(e) => setTeamFormData({...teamFormData, adminPassword: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
                        <input
                          type="email"
                          value={teamFormData.adminEmail}
                          onChange={(e) => setTeamFormData({...teamFormData, adminEmail: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Admin First Name</label>
                        <input
                          type="text"
                          value={teamFormData.adminFirstName}
                          onChange={(e) => setTeamFormData({...teamFormData, adminFirstName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Admin Last Name</label>
                        <input
                          type="text"
                          value={teamFormData.adminLastName}
                          onChange={(e) => setTeamFormData({...teamFormData, adminLastName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
                <button
                  onClick={() => setShowCreateTeamModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTeam}
                  className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                >
                  Create Team
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default SuperuserDashboard;