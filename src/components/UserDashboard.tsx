import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Eye, Calendar, Clock, AlertTriangle, CheckCircle, User, Play } from 'lucide-react';
import { Ticket, CreateTicketFormData } from '../types';
import { getTickets, getUsers, saveTickets, generateId, createNotification, getNotifications, saveNotifications } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';

interface UserDashboardProps {
  activeTab: string;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ activeTab }) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>(getTickets());
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const users = getUsers();

  const [ticketFormData, setTicketFormData] = useState<CreateTicketFormData>({
    title: '',
    description: '',
    priority: 'medium',
    category: 'support',
    assignedTo: '',
    teamId: user?.teamId,
    dueDate: undefined,
    estimatedHours: 0,
    tags: [],
    severity: 'medium',
    environment: 'production'
  });

  const myTickets = tickets.filter(ticket => ticket.assignedTo === user?.id || ticket.reportedBy === user?.id);

  const handleCreateTicket = () => {
    const newTicket: Ticket = {
      id: generateId(),
      title: ticketFormData.title,
      description: ticketFormData.description,
      priority: ticketFormData.priority,
      status: 'open',
      category: ticketFormData.category,
      assignedTo: ticketFormData.assignedTo,
      assignedBy: user?.id || '',
      reportedBy: user?.id || '',
      teamId: ticketFormData.teamId,
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate: ticketFormData.dueDate,
      estimatedHours: ticketFormData.estimatedHours,
      tags: ticketFormData.tags,
      severity: ticketFormData.severity,
      environment: ticketFormData.environment,
      comments: []
    };

    const updatedTickets = [...tickets, newTicket];
    setTickets(updatedTickets);
    saveTickets(updatedTickets);

    // Notify team admin about new ticket
    if (user?.teamId) {
      const teamAdmins = users.filter(u => u.teamId === user.teamId && u.role === 'admin');
      const notifications = getNotifications();
      
      teamAdmins.forEach(admin => {
        const notification = createNotification(
          admin.id,
          'ticket_assigned',
          'New Ticket Created',
          `${user.firstName} ${user.lastName} created a new ticket: "${newTicket.title}"`,
          newTicket.priority === 'urgent' || newTicket.priority === 'critical' ? 'high' : 'medium',
          newTicket.id
        );
        notifications.push(notification);
      });
      
      saveNotifications(notifications);
    }

    setShowCreateTicketModal(false);
    resetTicketForm();
  };

  const handleUpdateTicketStatus = (ticketId: string, newStatus: Ticket['status']) => {
    const updatedTickets = tickets.map(ticket => {
      if (ticket.id === ticketId && (ticket.assignedTo === user?.id || ticket.reportedBy === user?.id)) {
        const updatedTicket = { 
          ...ticket, 
          status: newStatus,
          updatedAt: new Date(),
          ...(newStatus === 'resolved' && { resolvedAt: new Date() }),
          ...(newStatus === 'closed' && { closedAt: new Date() })
        };
        
        // Notify relevant users about status change
        const notifications = getNotifications();
        const assignedByUser = users.find(u => u.id === ticket.assignedBy);
        
        if (assignedByUser && assignedByUser.id !== user?.id) {
          const notification = createNotification(
            assignedByUser.id,
            'ticket_updated',
            'Ticket Status Updated',
            `${user?.firstName} ${user?.lastName} updated ticket "${ticket.title}" to ${newStatus}`,
            'medium',
            ticket.id
          );
          notifications.push(notification);
        }
        
        saveNotifications(notifications);
        return updatedTicket;
      }
      return ticket;
    });

    setTickets(updatedTickets);
    saveTickets(updatedTickets);
  };

  const resetTicketForm = () => {
    setTicketFormData({
      title: '',
      description: '',
      priority: 'medium',
      category: 'support',
      assignedTo: '',
      teamId: user?.teamId,
      dueDate: undefined,
      estimatedHours: 0,
      tags: [],
      severity: 'medium',
      environment: 'production'
    });
  };

  const filteredTickets = myTickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

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

  if (activeTab === 'my-tickets') {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
            <p className="text-gray-600 mt-2">View and manage your tickets</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tickets..."
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
                  <option value="pending">Pending</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="all">All Priority</option>
                  <option value="critical">Critical</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Tickets List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">My Tickets ({filteredTickets.length})</h2>
          </div>
          <div className="p-6">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No tickets found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTickets.map(ticket => {
                  const assignedUser = users.find(u => u.id === ticket.assignedTo);
                  const reportedByUser = users.find(u => u.id === ticket.reportedBy);
                  const isOverdue = ticket.dueDate && new Date(ticket.dueDate) < new Date() && !['resolved', 'closed'].includes(ticket.status);
                  const isAssignedToMe = ticket.assignedTo === user?.id;
                  
                  return (
                    <div key={ticket.id} className={`border rounded-xl p-6 transition-all hover:shadow-md ${
                      isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-bold text-gray-900 text-lg">{ticket.title}</h3>
                            {isOverdue && (
                              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">
                                OVERDUE
                              </span>
                            )}
                            {isAssignedToMe && (
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                                ASSIGNED TO ME
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-3">{ticket.description}</p>
                          
                          <div className="flex items-center space-x-4 mb-4">
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
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500 mb-4">
                            <div>Created: {new Date(ticket.createdAt).toLocaleDateString()}</div>
                            <div>Updated: {new Date(ticket.updatedAt).toLocaleDateString()}</div>
                            {ticket.dueDate && (
                              <div className={isOverdue ? 'text-red-600 font-semibold' : ''}>
                                Due: {new Date(ticket.dueDate).toLocaleDateString()}
                              </div>
                            )}
                            {ticket.estimatedHours && (
                              <div>Est: {ticket.estimatedHours}h</div>
                            )}
                          </div>
                          
                          {(assignedUser || reportedByUser) && (
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                              {assignedUser && (
                                <div>Assigned to: <span className="font-medium">{assignedUser.firstName} {assignedUser.lastName}</span></div>
                              )}
                              {reportedByUser && (
                                <div>Reported by: <span className="font-medium">{reportedByUser.firstName} {reportedByUser.lastName}</span></div>
                              )}
                            </div>
                          )}

                          {/* Action Buttons */}
                          {isAssignedToMe && (
                            <div className="flex space-x-2">
                              {ticket.status === 'open' && (
                                <button
                                  onClick={() => handleUpdateTicketStatus(ticket.id, 'in-progress')}
                                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center space-x-2"
                                >
                                  <Play className="w-4 h-4" />
                                  <span>Start Work</span>
                                </button>
                              )}
                              {ticket.status === 'in-progress' && (
                                <button
                                  onClick={() => handleUpdateTicketStatus(ticket.id, 'resolved')}
                                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center space-x-2"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  <span>Mark Resolved</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex space-x-2 ml-6">
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
            )}
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'create-ticket') {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Ticket</h1>
          <p className="text-gray-600 mt-2">Report an issue or request support</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={ticketFormData.title}
                onChange={(e) => setTicketFormData({...ticketFormData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={ticketFormData.priority}
                onChange={(e) => setTicketFormData({...ticketFormData, priority: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={ticketFormData.category}
                onChange={(e) => setTicketFormData({...ticketFormData, category: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="support">Support</option>
                <option value="maintenance">Maintenance</option>
                <option value="enhancement">Enhancement</option>
                <option value="security">Security Issue</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Environment</label>
              <select
                value={ticketFormData.environment}
                onChange={(e) => setTicketFormData({...ticketFormData, environment: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="production">Production</option>
                <option value="staging">Staging</option>
                <option value="development">Development</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={ticketFormData.description}
                onChange={(e) => setTicketFormData({...ticketFormData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={6}
                placeholder="Please provide detailed information about the issue or request..."
                required
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleCreateTicket}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
            >
              Create Ticket
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default UserDashboard;