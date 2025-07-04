import { User, Team, Task, Notification } from '../types';

export const defaultUsers: User[] = [
  // Superuser
  {
    id: '1',
    username: 'superuser',
    email: 'ceo@enterprise.com',
    role: 'superuser',
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date('2024-01-20'),
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    password: 'password'
  },
  
  // Development Team
  {
    id: '2',
    username: 'admin1',
    email: 'john.smith@enterprise.com',
    role: 'admin',
    teamId: '1',
    createdAt: new Date('2024-01-02'),
    lastLogin: new Date('2024-01-20'),
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    addedBy: '1',
    password: 'password'
  },
  {
    id: '3',
    username: 'user1',
    email: 'sarah.johnson@enterprise.com',
    role: 'user',
    teamId: '1',
    createdAt: new Date('2024-01-03'),
    lastLogin: new Date('2024-01-20'),
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    addedBy: '2',
    password: 'password'
  },
  {
    id: '4',
    username: 'user2',
    email: 'mike.davis@enterprise.com',
    role: 'user',
    teamId: '1',
    createdAt: new Date('2024-01-04'),
    lastLogin: new Date('2024-01-19'),
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    addedBy: '2',
    password: 'password'
  },
  {
    id: '5',
    username: 'user3',
    email: 'emily.wilson@enterprise.com',
    role: 'user',
    teamId: '1',
    createdAt: new Date('2024-01-05'),
    lastLogin: new Date('2024-01-20'),
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    addedBy: '2',
    password: 'password'
  },
  
  // Design Team
  {
    id: '6',
    username: 'admin2',
    email: 'alex.brown@enterprise.com',
    role: 'admin',
    teamId: '2',
    createdAt: new Date('2024-01-06'),
    lastLogin: new Date('2024-01-20'),
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    addedBy: '1',
    password: 'password'
  },
  {
    id: '7',
    username: 'user4',
    email: 'lisa.garcia@enterprise.com',
    role: 'user',
    teamId: '2',
    createdAt: new Date('2024-01-07'),
    lastLogin: new Date('2024-01-20'),
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    addedBy: '6',
    password: 'password'
  },
  {
    id: '8',
    username: 'user5',
    email: 'david.martinez@enterprise.com',
    role: 'user',
    teamId: '2',
    createdAt: new Date('2024-01-08'),
    lastLogin: new Date('2024-01-19'),
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    addedBy: '6',
    password: 'password'
  },
  
  // Marketing Team
  {
    id: '9',
    username: 'admin3',
    email: 'jennifer.lee@enterprise.com',
    role: 'admin',
    teamId: '3',
    createdAt: new Date('2024-01-09'),
    lastLogin: new Date('2024-01-20'),
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
    addedBy: '1',
    password: 'password'
  },
  {
    id: '10',
    username: 'user6',
    email: 'robert.taylor@enterprise.com',
    role: 'user',
    teamId: '3',
    createdAt: new Date('2024-01-10'),
    lastLogin: new Date('2024-01-20'),
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    addedBy: '9',
    password: 'password'
  },
  {
    id: '11',
    username: 'user7',
    email: 'amanda.white@enterprise.com',
    role: 'user',
    teamId: '3',
    createdAt: new Date('2024-01-11'),
    lastLogin: new Date('2024-01-19'),
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    addedBy: '9',
    password: 'password'
  },
  
  // QA Team
  {
    id: '12',
    username: 'admin4',
    email: 'chris.anderson@enterprise.com',
    role: 'admin',
    teamId: '4',
    createdAt: new Date('2024-01-12'),
    lastLogin: new Date('2024-01-20'),
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    addedBy: '1',
    password: 'password'
  },
  {
    id: '13',
    username: 'user8',
    email: 'nicole.thomas@enterprise.com',
    role: 'user',
    teamId: '4',
    createdAt: new Date('2024-01-13'),
    lastLogin: new Date('2024-01-20'),
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    addedBy: '12',
    password: 'password'
  },
  {
    id: '14',
    username: 'user9',
    email: 'kevin.jackson@enterprise.com',
    role: 'user',
    teamId: '4',
    createdAt: new Date('2024-01-14'),
    lastLogin: new Date('2024-01-19'),
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    addedBy: '12',
    password: 'password'
  }
];

export const defaultTeams: Team[] = [
  {
    id: '1',
    name: 'Development Team',
    description: 'Full-stack development, architecture, and technical implementation',
    adminIds: ['2'],
    memberIds: ['2', '3', '4', '5'],
    createdAt: new Date('2024-01-01'),
    department: 'Engineering',
    createdBy: '1'
  },
  {
    id: '2',
    name: 'Design Team',
    description: 'UI/UX design, visual identity, and user experience optimization',
    adminIds: ['6'],
    memberIds: ['6', '7', '8'],
    createdAt: new Date('2024-01-02'),
    department: 'Design',
    createdBy: '1'
  },
  {
    id: '3',
    name: 'Marketing Team',
    description: 'Digital marketing, content strategy, and brand management',
    adminIds: ['9'],
    memberIds: ['9', '10', '11'],
    createdAt: new Date('2024-01-03'),
    department: 'Marketing',
    createdBy: '1'
  },
  {
    id: '4',
    name: 'Quality Assurance',
    description: 'Testing, quality control, and performance optimization',
    adminIds: ['12'],
    memberIds: ['12', '13', '14'],
    createdAt: new Date('2024-01-04'),
    department: 'QA',
    createdBy: '1'
  }
];

export const defaultTasks: Task[] = [
  // Development Team Tasks
  {
    id: '1',
    title: 'Implement User Authentication System',
    description: 'Design and develop a comprehensive authentication system with JWT tokens, password reset, and multi-factor authentication',
    priority: 'high',
    status: 'in-progress',
    assignedTo: '3',
    assignedBy: '2',
    teamId: '1',
    createdAt: new Date('2024-01-10'),
    startedAt: new Date('2024-01-11'),
    startDate: new Date('2024-01-11'),
    endDate: new Date('2024-02-01'),
    estimatedHours: 40,
    actualHours: 25,
    tags: ['backend', 'security', 'authentication']
  },
  {
    id: '2',
    title: 'Database Schema Optimization',
    description: 'Optimize database queries and implement proper indexing for better performance',
    priority: 'urgent',
    status: 'open',
    assignedTo: '4',
    assignedBy: '2',
    teamId: '1',
    createdAt: new Date('2024-01-12'),
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-01-25'),
    estimatedHours: 32,
    actualHours: 0,
    tags: ['database', 'performance', 'optimization']
  },
  {
    id: '3',
    title: 'API Documentation Update',
    description: 'Update API documentation with new endpoints and authentication methods',
    priority: 'medium',
    status: 'completed',
    assignedTo: '5',
    assignedBy: '2',
    teamId: '1',
    createdAt: new Date('2024-01-08'),
    startedAt: new Date('2024-01-09'),
    completedAt: new Date('2024-01-18'),
    startDate: new Date('2024-01-09'),
    endDate: new Date('2024-01-20'),
    estimatedHours: 16,
    actualHours: 14,
    tags: ['documentation', 'api']
  },
  {
    id: '4',
    title: 'Frontend Component Library',
    description: 'Create reusable React components for the design system',
    priority: 'high',
    status: 'in-progress',
    assignedTo: '3',
    assignedBy: '2',
    teamId: '1',
    createdAt: new Date('2024-01-11'),
    startedAt: new Date('2024-01-12'),
    startDate: new Date('2024-01-12'),
    endDate: new Date('2024-02-05'),
    estimatedHours: 60,
    actualHours: 35,
    tags: ['frontend', 'react', 'components']
  },
  {
    id: '5',
    title: 'Unit Test Coverage Improvement',
    description: 'Increase unit test coverage to 90% across all modules',
    priority: 'medium',
    status: 'open',
    assignedTo: '4',
    assignedBy: '2',
    teamId: '1',
    createdAt: new Date('2024-01-15'),
    startDate: new Date('2024-01-20'),
    endDate: new Date('2024-02-10'),
    estimatedHours: 48,
    actualHours: 0,
    tags: ['testing', 'quality']
  },

  // Design Team Tasks
  {
    id: '6',
    title: 'Dashboard UI/UX Redesign',
    description: 'Complete redesign of the main dashboard with modern UI patterns and improved user experience',
    priority: 'high',
    status: 'completed',
    assignedTo: '7',
    assignedBy: '6',
    teamId: '2',
    createdAt: new Date('2024-01-08'),
    startedAt: new Date('2024-01-09'),
    completedAt: new Date('2024-01-19'),
    startDate: new Date('2024-01-09'),
    endDate: new Date('2024-01-20'),
    estimatedHours: 45,
    actualHours: 42,
    tags: ['ui', 'ux', 'dashboard']
  },
  {
    id: '7',
    title: 'Mobile App Wireframes',
    description: 'Create detailed wireframes for the mobile application',
    priority: 'medium',
    status: 'in-progress',
    assignedTo: '8',
    assignedBy: '6',
    teamId: '2',
    createdAt: new Date('2024-01-12'),
    startedAt: new Date('2024-01-13'),
    startDate: new Date('2024-01-13'),
    endDate: new Date('2024-01-30'),
    estimatedHours: 30,
    actualHours: 18,
    tags: ['mobile', 'wireframes', 'planning']
  },
  {
    id: '8',
    title: 'Brand Guidelines Documentation',
    description: 'Develop comprehensive brand guidelines and style guide',
    priority: 'low',
    status: 'open',
    assignedTo: '7',
    assignedBy: '6',
    teamId: '2',
    createdAt: new Date('2024-01-14'),
    startDate: new Date('2024-01-25'),
    endDate: new Date('2024-02-15'),
    estimatedHours: 24,
    actualHours: 0,
    tags: ['branding', 'documentation']
  },

  // Marketing Team Tasks
  {
    id: '9',
    title: 'Q1 Marketing Campaign Strategy',
    description: 'Develop comprehensive marketing strategy for Q1 product launch',
    priority: 'urgent',
    status: 'in-progress',
    assignedTo: '10',
    assignedBy: '9',
    teamId: '3',
    createdAt: new Date('2024-01-09'),
    startedAt: new Date('2024-01-10'),
    startDate: new Date('2024-01-10'),
    endDate: new Date('2024-01-28'),
    estimatedHours: 50,
    actualHours: 30,
    tags: ['strategy', 'campaign', 'launch']
  },
  {
    id: '10',
    title: 'Social Media Content Calendar',
    description: 'Create content calendar for social media platforms for next quarter',
    priority: 'medium',
    status: 'completed',
    assignedTo: '11',
    assignedBy: '9',
    teamId: '3',
    createdAt: new Date('2024-01-07'),
    startedAt: new Date('2024-01-08'),
    completedAt: new Date('2024-01-17'),
    startDate: new Date('2024-01-08'),
    endDate: new Date('2024-01-18'),
    estimatedHours: 20,
    actualHours: 18,
    tags: ['social-media', 'content', 'planning']
  },
  {
    id: '11',
    title: 'Email Marketing Automation',
    description: 'Set up automated email sequences for user onboarding',
    priority: 'high',
    status: 'open',
    assignedTo: '10',
    assignedBy: '9',
    teamId: '3',
    createdAt: new Date('2024-01-13'),
    startDate: new Date('2024-01-20'),
    endDate: new Date('2024-02-05'),
    estimatedHours: 35,
    actualHours: 0,
    tags: ['email', 'automation', 'onboarding']
  },

  // QA Team Tasks
  {
    id: '12',
    title: 'Automated Testing Framework',
    description: 'Implement comprehensive automated testing framework for CI/CD pipeline',
    priority: 'high',
    status: 'in-progress',
    assignedTo: '13',
    assignedBy: '12',
    teamId: '4',
    createdAt: new Date('2024-01-10'),
    startedAt: new Date('2024-01-11'),
    startDate: new Date('2024-01-11'),
    endDate: new Date('2024-02-01'),
    estimatedHours: 55,
    actualHours: 32,
    tags: ['automation', 'testing', 'ci-cd']
  },
  {
    id: '13',
    title: 'Performance Testing Suite',
    description: 'Develop performance testing suite for load and stress testing',
    priority: 'medium',
    status: 'open',
    assignedTo: '14',
    assignedBy: '12',
    teamId: '4',
    createdAt: new Date('2024-01-11'),
    startDate: new Date('2024-01-18'),
    endDate: new Date('2024-02-08'),
    estimatedHours: 40,
    actualHours: 0,
    tags: ['performance', 'load-testing']
  },
  {
    id: '14',
    title: 'Security Vulnerability Assessment',
    description: 'Conduct comprehensive security assessment and penetration testing',
    priority: 'urgent',
    status: 'completed',
    assignedTo: '13',
    assignedBy: '12',
    teamId: '4',
    createdAt: new Date('2024-01-05'),
    startedAt: new Date('2024-01-06'),
    completedAt: new Date('2024-01-16'),
    startDate: new Date('2024-01-06'),
    endDate: new Date('2024-01-18'),
    estimatedHours: 30,
    actualHours: 28,
    tags: ['security', 'assessment', 'penetration-testing']
  }
];

export const defaultNotifications: Notification[] = [
  // Admin notifications for task completion
  {
    id: '1',
    userId: '2',
    type: 'task_completed',
    message: 'Sarah Johnson completed "API Documentation Update"',
    read: false,
    createdAt: new Date('2024-01-18'),
    taskId: '3'
  },
  {
    id: '2',
    userId: '6',
    type: 'task_completed',
    message: 'Lisa Garcia completed "Dashboard UI/UX Redesign"',
    read: false,
    createdAt: new Date('2024-01-19'),
    taskId: '6'
  },
  {
    id: '3',
    userId: '9',
    type: 'task_completed',
    message: 'Amanda White completed "Social Media Content Calendar"',
    read: false,
    createdAt: new Date('2024-01-17'),
    taskId: '10'
  },
  {
    id: '4',
    userId: '12',
    type: 'task_completed',
    message: 'Nicole Thomas completed "Security Vulnerability Assessment"',
    read: false,
    createdAt: new Date('2024-01-16'),
    taskId: '14'
  },

  // Team creation notifications
  {
    id: '5',
    userId: '2',
    type: 'team_created',
    message: 'A new team "Development Team" has been created by superuser',
    read: false,
    createdAt: new Date('2024-01-01'),
    teamId: '1'
  },
  {
    id: '6',
    userId: '6',
    type: 'team_created',
    message: 'A new team "Design Team" has been created by superuser',
    read: false,
    createdAt: new Date('2024-01-02'),
    teamId: '2'
  },
  {
    id: '7',
    userId: '9',
    type: 'team_created',
    message: 'A new team "Marketing Team" has been created by superuser',
    read: false,
    createdAt: new Date('2024-01-03'),
    teamId: '3'
  },
  {
    id: '8',
    userId: '12',
    type: 'team_created',
    message: 'A new team "Quality Assurance" has been created by superuser',
    read: false,
    createdAt: new Date('2024-01-04'),
    teamId: '4'
  },

  // User notifications for task assignment
  {
    id: '9',
    userId: '3',
    type: 'task_assigned',
    message: 'You have been assigned "Implement User Authentication System" by John Smith',
    read: false,
    createdAt: new Date('2024-01-10'),
    taskId: '1'
  },
  {
    id: '10',
    userId: '4',
    type: 'task_assigned',
    message: 'You have been assigned "Database Schema Optimization" by John Smith',
    read: false,
    createdAt: new Date('2024-01-12'),
    taskId: '2'
  },
  {
    id: '11',
    userId: '7',
    type: 'task_assigned',
    message: 'You have been assigned "Brand Guidelines Documentation" by Alex Brown',
    read: false,
    createdAt: new Date('2024-01-14'),
    taskId: '8'
  },
  {
    id: '12',
    userId: '10',
    type: 'task_assigned',
    message: 'You have been assigned "Email Marketing Automation" by Jennifer Lee',
    read: false,
    createdAt: new Date('2024-01-13'),
    taskId: '11'
  }
];