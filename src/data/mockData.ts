import { User, Team, Ticket, Notification } from '../types';

export const defaultUsers: User[] = [
  {
    id: '1',
    username: 'superuser',
    email: 'admin@enterprise.com',
    firstName: 'System',
    lastName: 'Administrator',
    phone: '+1-555-0001',
    role: 'superuser',
    department: 'IT Administration',
    position: 'Chief Technology Officer',
    status: 'active',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    lastLogin: new Date('2024-01-20'),
    password: 'password',
    permissions: ['all'],
    address: {
      street: '123 Corporate Blvd',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Emergency Services',
      phone: '+1-555-911',
      relationship: 'Emergency'
    }
  },
  {
    id: '2',
    username: 'admin1',
    email: 'john.smith@enterprise.com',
    firstName: 'John',
    lastName: 'Smith',
    phone: '+1-555-0102',
    role: 'admin',
    department: 'Engineering',
    position: 'Engineering Manager',
    teamId: '1',
    status: 'active',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
    lastLogin: new Date('2024-01-20'),
    password: 'password',
    addedBy: '1',
    permissions: ['team_management', 'ticket_management'],
    address: {
      street: '456 Tech Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94107',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Jane Smith',
      phone: '+1-555-0103',
      relationship: 'Spouse'
    }
  },
  {
    id: '3',
    username: 'user1',
    email: 'sarah.johnson@enterprise.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    phone: '+1-555-0201',
    role: 'user',
    department: 'Engineering',
    position: 'Senior Developer',
    teamId: '1',
    status: 'active',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
    lastLogin: new Date('2024-01-20'),
    password: 'password',
    addedBy: '2',
    permissions: ['ticket_create', 'ticket_update'],
    address: {
      street: '789 Developer Ave',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94108',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Mike Johnson',
      phone: '+1-555-0202',
      relationship: 'Brother'
    }
  },
  {
    id: '4',
    username: 'admin2',
    email: 'alex.brown@enterprise.com',
    firstName: 'Alex',
    lastName: 'Brown',
    phone: '+1-555-0302',
    role: 'admin',
    department: 'Design',
    position: 'Design Director',
    teamId: '2',
    status: 'active',
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-04'),
    lastLogin: new Date('2024-01-20'),
    password: 'password',
    addedBy: '1',
    permissions: ['team_management', 'ticket_management'],
    address: {
      street: '321 Design Plaza',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94109',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Lisa Brown',
      phone: '+1-555-0303',
      relationship: 'Spouse'
    }
  },
  {
    id: '5',
    username: 'user2',
    email: 'emily.davis@enterprise.com',
    firstName: 'Emily',
    lastName: 'Davis',
    phone: '+1-555-0401',
    role: 'user',
    department: 'Design',
    position: 'UI/UX Designer',
    teamId: '2',
    status: 'active',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
    lastLogin: new Date('2024-01-19'),
    password: 'password',
    addedBy: '4',
    permissions: ['ticket_create', 'ticket_update'],
    address: {
      street: '654 Creative Way',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94110',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Robert Davis',
      phone: '+1-555-0402',
      relationship: 'Father'
    }
  }
];

export const defaultTeams: Team[] = [
  {
    id: '1',
    name: 'Engineering Team',
    description: 'Full-stack development, architecture, and technical implementation',
    department: 'Engineering',
    adminIds: ['2'],
    memberIds: ['2', '3'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    createdBy: '1',
    status: 'active',
    budget: 500000,
    location: 'San Francisco HQ - Floor 3'
  },
  {
    id: '2',
    name: 'Design Team',
    description: 'UI/UX design, visual identity, and user experience optimization',
    department: 'Design',
    adminIds: ['4'],
    memberIds: ['4', '5'],
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
    createdBy: '1',
    status: 'active',
    budget: 300000,
    location: 'San Francisco HQ - Floor 2'
  }
];

export const defaultTickets: Ticket[] = [
  {
    id: '1',
    title: 'Login System Authentication Bug',
    description: 'Users are experiencing intermittent login failures with valid credentials. The issue appears to be related to session management and token validation.',
    priority: 'high',
    status: 'in-progress',
    category: 'bug',
    assignedTo: '3',
    assignedBy: '2',
    reportedBy: '5',
    teamId: '1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-18'),
    dueDate: new Date('2024-01-25'),
    estimatedHours: 16,
    actualHours: 8,
    tags: ['authentication', 'security', 'urgent'],
    severity: 'high',
    environment: 'production',
    comments: [
      {
        id: 'c1',
        ticketId: '1',
        userId: '3',
        content: 'Started investigating the issue. Found potential race condition in token validation.',
        createdAt: new Date('2024-01-16'),
        isInternal: true
      }
    ]
  },
  {
    id: '2',
    title: 'Dashboard Performance Optimization',
    description: 'The main dashboard is loading slowly for users with large datasets. Need to implement pagination and optimize database queries.',
    priority: 'medium',
    status: 'open',
    category: 'enhancement',
    assignedTo: '3',
    assignedBy: '2',
    reportedBy: '2',
    teamId: '1',
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
    dueDate: new Date('2024-02-01'),
    estimatedHours: 24,
    actualHours: 0,
    tags: ['performance', 'dashboard', 'optimization'],
    severity: 'medium',
    environment: 'production'
  },
  {
    id: '3',
    title: 'Mobile App UI Redesign',
    description: 'Redesign the mobile application interface to improve user experience and align with new brand guidelines.',
    priority: 'low',
    status: 'open',
    category: 'feature',
    assignedTo: '5',
    assignedBy: '4',
    reportedBy: '4',
    teamId: '2',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    dueDate: new Date('2024-02-15'),
    estimatedHours: 40,
    actualHours: 0,
    tags: ['mobile', 'ui', 'redesign'],
    severity: 'low',
    environment: 'development'
  }
];

export const defaultNotifications: Notification[] = [
  {
    id: '1',
    userId: '3',
    type: 'ticket_assigned',
    title: 'New Ticket Assigned',
    message: 'You have been assigned ticket "Login System Authentication Bug"',
    read: false,
    createdAt: new Date('2024-01-15'),
    ticketId: '1',
    priority: 'high'
  },
  {
    id: '2',
    userId: '2',
    type: 'ticket_updated',
    title: 'Ticket Updated',
    message: 'Sarah Johnson updated ticket "Login System Authentication Bug"',
    read: false,
    createdAt: new Date('2024-01-16'),
    ticketId: '1',
    priority: 'medium'
  },
  {
    id: '3',
    userId: '5',
    type: 'ticket_assigned',
    title: 'New Ticket Assigned',
    message: 'You have been assigned ticket "Mobile App UI Redesign"',
    read: false,
    createdAt: new Date('2024-01-20'),
    ticketId: '3',
    priority: 'low'
  }
];