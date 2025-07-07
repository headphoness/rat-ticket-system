export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'superuser' | 'admin' | 'user';
  department?: string;
  position?: string;
  teamId?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  avatar?: string;
  addedBy?: string;
  password: string;
  permissions?: string[];
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface Team {
  id: string;
  name: string;
  description: string;
  department: string;
  adminIds: string[];
  memberIds: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  status: 'active' | 'inactive';
  budget?: number;
  location?: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  status: 'open' | 'in-progress' | 'pending' | 'resolved' | 'closed' | 'cancelled';
  category: 'bug' | 'feature' | 'support' | 'maintenance' | 'enhancement' | 'security';
  assignedTo?: string;
  assignedBy: string;
  reportedBy: string;
  teamId?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  tags?: string[];
  attachments?: string[];
  comments?: TicketComment[];
  resolution?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  environment?: 'development' | 'staging' | 'production';
}

export interface TicketComment {
  id: string;
  ticketId: string;
  userId: string;
  content: string;
  createdAt: Date;
  isInternal: boolean;
  attachments?: string[];
}

export interface Notification {
  id: string;
  userId: string;
  type: 'ticket_assigned' | 'ticket_updated' | 'ticket_resolved' | 'ticket_overdue' | 'team_created' | 'user_added' | 'system_alert';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  ticketId?: string;
  teamId?: string;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  overdueTickets: number;
  avgResolutionTime: number;
  userSatisfaction: number;
  ticketsByPriority: { [key: string]: number };
  ticketsByCategory: { [key: string]: number };
}

export interface CreateUserFormData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'admin' | 'user';
  department: string;
  position: string;
  teamId?: string;
  password: string;
  confirmPassword: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface CreateTeamFormData {
  name: string;
  description: string;
  department: string;
  adminUsername?: string;
  adminPassword?: string;
  adminEmail?: string;
  adminFirstName?: string;
  adminLastName?: string;
  budget?: number;
  location?: string;
}

export interface CreateTicketFormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  category: 'bug' | 'feature' | 'support' | 'maintenance' | 'enhancement' | 'security';
  assignedTo?: string;
  teamId?: string;
  dueDate?: Date;
  estimatedHours?: number;
  tags?: string[];
  severity?: 'low' | 'medium' | 'high' | 'critical';
  environment?: 'development' | 'staging' | 'production';
}