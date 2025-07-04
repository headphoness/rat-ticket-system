export interface User {
  id: string;
  username: string;
  email: string;
  role: 'superuser' | 'admin' | 'user';
  teamId?: string;
  createdAt: Date;
  lastLogin?: Date;
  avatar?: string;
  addedBy?: string;
  password?: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  adminIds: string[];
  memberIds: string[];
  createdAt: Date;
  department: string;
  createdBy: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'completed';
  assignedTo: string;
  assignedBy: string;
  teamId: string;
  createdAt: Date;
  completedAt?: Date;
  startDate?: Date;
  endDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  tags?: string[];
  startedAt?: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'task_assigned' | 'task_completed' | 'task_updated' | 'task_overdue' | 'task_started' | 'team_created' | 'team_updated';
  message: string;
  read: boolean;
  createdAt: Date;
  taskId?: string;
  teamId?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

export interface TeamDetailModalProps {
  team: Team;
  isOpen: boolean;
  onClose: () => void;
}

export interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  textColor: string;
  onClick?: () => void;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}