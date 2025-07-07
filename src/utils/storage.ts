import { User, Team, Ticket, Notification } from '../types';
import { defaultUsers, defaultTeams, defaultTickets, defaultNotifications } from '../data/mockData';

const STORAGE_KEYS = {
  USERS: 'ticketing_users',
  TEAMS: 'ticketing_teams',
  TICKETS: 'ticketing_tickets',
  NOTIFICATIONS: 'ticketing_notifications',
  CURRENT_USER: 'ticketing_current_user'
};

// Initialize default data if not exists
export const initializeData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TEAMS)) {
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(defaultTeams));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TICKETS)) {
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(defaultTickets));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(defaultNotifications));
  }
};

// Users
export const getUsers = (): User[] => {
  const users = localStorage.getItem(STORAGE_KEYS.USERS);
  return users ? JSON.parse(users) : [];
};

export const saveUsers = (users: User[]) => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const getUserById = (id: string): User | null => {
  const users = getUsers();
  return users.find(user => user.id === id) || null;
};

// Teams
export const getTeams = (): Team[] => {
  const teams = localStorage.getItem(STORAGE_KEYS.TEAMS);
  return teams ? JSON.parse(teams) : [];
};

export const saveTeams = (teams: Team[]) => {
  localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
};

// Tickets
export const getTickets = (): Ticket[] => {
  const tickets = localStorage.getItem(STORAGE_KEYS.TICKETS);
  return tickets ? JSON.parse(tickets) : [];
};

export const saveTickets = (tickets: Ticket[]) => {
  localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
};

// Notifications
export const getNotifications = (): Notification[] => {
  const notifications = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
  return notifications ? JSON.parse(notifications) : [];
};

export const saveNotifications = (notifications: Notification[]) => {
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
};

// Current User
export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

// Utility functions
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const createNotification = (
  userId: string,
  type: Notification['type'],
  title: string,
  message: string,
  priority: 'low' | 'medium' | 'high' = 'medium',
  ticketId?: string,
  teamId?: string
): Notification => {
  return {
    id: generateId(),
    userId,
    type,
    title,
    message,
    read: false,
    createdAt: new Date(),
    priority,
    ticketId,
    teamId
  };
};