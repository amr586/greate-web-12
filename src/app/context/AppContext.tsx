import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Request, USERS, REQUESTS, CONTACT_MESSAGES, ContactMessage, Property, PROPERTIES, Task, TASKS, getSimilarProperties, generateAdCode } from '../data/mockData';

interface AppContextType {
  currentUser: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  requests: Request[];
  addRequest: (req: Omit<Request, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRequestStatus: (id: string, status: Request['status']) => void;
  deleteRequest: (id: string) => void;
  properties: Property[];
  addProperty: (prop: Omit<Property, 'id' | 'createdAt'>) => void;
  updateProperty: (id: string, updates: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  contactMessages: ContactMessage[];
  addContactMessage: (msg: Omit<ContactMessage, 'id' | 'createdAt' | 'read'>) => void;
  markMessageRead: (id: string) => void;
  users: User[];
  updateUser: (id: string, updates: Partial<User>) => void;
  savedProperties: string[];
  toggleSaveProperty: (id: string) => void;
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getSimilarPropertiesFor: (propertyId: string) => Property[];
}

const AppContext = createContext<AppContextType | null>(null);

const DEMO_CREDENTIALS = {
  'admin@estate.com': { password: 'admin123', userId: 'u1' },
  'khaled@estate.com': { password: 'admin123', userId: 'u5' },
  'fatma@estate.com': { password: 'admin123', userId: 'u6' },
  'user@example.com': { password: 'user123', userId: 'u2' },
  'sara@example.com': { password: 'user123', userId: 'u3' },
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<Request[]>(REQUESTS);
  const [properties, setProperties] = useState<Property[]>(PROPERTIES);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>(CONTACT_MESSAGES);
  const [users, setUsers] = useState<User[]>(USERS);
  const [savedProperties, setSavedProperties] = useState<string[]>([]);
  const [tasks, setTasks] = useState<Task[]>(TASKS);

  useEffect(() => {
    const saved = localStorage.getItem('estate_user');
    if (saved) {
      const user = JSON.parse(saved);
      setCurrentUser(user);
    }
    const savedProps = localStorage.getItem('estate_saved_props');
    if (savedProps) {
      setSavedProperties(JSON.parse(savedProps));
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    const cred = DEMO_CREDENTIALS[email as keyof typeof DEMO_CREDENTIALS];
    if (cred && cred.password === password) {
      const user = USERS.find(u => u.id === cred.userId);
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('estate_user', JSON.stringify(user));
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('estate_user');
  };

  const addRequest = (req: Omit<Request, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newReq: Request = {
      ...req,
      id: `r${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setRequests(prev => [newReq, ...prev]);
  };

  const updateRequestStatus = (id: string, status: Request['status']) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status, updatedAt: new Date().toISOString().split('T')[0] } : r));
  };

  const deleteRequest = (id: string) => {
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  const addProperty = (prop: Omit<Property, 'id' | 'createdAt'>) => {
    const newProp: Property = {
      ...prop,
      id: `p${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      adCode: generateAdCode(),
      adminId: currentUser?.id,
    };
    setProperties(prev => [newProp, ...prev]);
  };

  const updateProperty = (id: string, updates: Partial<Property>) => {
    setProperties(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProperty = (id: string) => {
    setProperties(prev => prev.filter(p => p.id !== id));
  };

  const addContactMessage = (msg: Omit<ContactMessage, 'id' | 'createdAt' | 'read'>) => {
    const newMsg: ContactMessage = {
      ...msg,
      id: `c${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      read: false,
    };
    setContactMessages(prev => [newMsg, ...prev]);
  };

  const markMessageRead = (id: string) => {
    setContactMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
  };

  const toggleSaveProperty = (id: string) => {
    setSavedProperties(prev => {
      const updated = prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id];
      localStorage.setItem('estate_saved_props', JSON.stringify(updated));
      return updated;
    });
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  };

  const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...task,
      id: `t${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const getSimilarPropertiesFor = (propertyId: string): Property[] => {
    const property = properties.find(p => p.id === propertyId);
    if (!property) return [];
    return getSimilarProperties(property, properties);
  };

  return (
    <AppContext.Provider value={{
      currentUser, login, logout,
      requests, addRequest, updateRequestStatus, deleteRequest,
      properties, addProperty, updateProperty, deleteProperty,
      contactMessages, addContactMessage, markMessageRead,
      users, updateUser, savedProperties, toggleSaveProperty,
      tasks, addTask, updateTask, deleteTask,
      getSimilarPropertiesFor,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
