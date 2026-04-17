import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router';
import { AuthProvider } from './app/context/AuthContext';
import Root from './app/pages/Root';
import Home from './app/pages/Home';
import Properties from './app/pages/Properties';
import { PropertyDetailEnhanced } from './app/pages/PropertyDetailEnhanced';
import Login from './app/pages/Login';
import Register from './app/pages/Register';
import Contact from './app/pages/Contact';
import UserAddProperty from './app/pages/UserAddProperty';
import AdminAddProperty from './app/pages/AdminAddProperty';
import SuperAdminDashboard from './app/pages/SuperAdminDashboard';
import AdminDashboard from './app/pages/AdminDashboard';
import SubAdminDashboard from './app/pages/SubAdminDashboard';
import UserDashboard from './app/pages/UserDashboard';
import PaymentPage from './app/pages/PaymentPage';
import AdminNotifications from './app/pages/AdminNotifications';
import { SavedProperties } from './app/pages/SavedProperties';
import ForgotPassword from './app/pages/ForgotPassword';
import UserEditProperty from './app/pages/UserEditProperty';
import CRMEntry from './app/pages/CRMEntry';
import './styles/globals.css';

const router = createBrowserRouter([
  { path: '/crm', element: <CRMEntry /> },
  {
    path: '/',
    element: <Root />,
    children: [
      { index: true, element: <Home /> },
      { path: 'properties', element: <Properties /> },
      { path: 'properties/:id', element: <PropertyDetailEnhanced /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'forgot-password', element: <ForgotPassword /> },
      { path: 'contact', element: <Contact /> },
      { path: 'sell', element: <UserAddProperty /> },
      { path: 'add-property', element: <Navigate to="/sell" replace /> },
      { path: 'dashboard', element: <UserDashboard /> },
      { path: 'saved', element: <SavedProperties /> },
      { path: 'admin', element: <AdminDashboard /> },
      { path: 'admin/notifications', element: <AdminNotifications /> },
      { path: 'admin/add-property', element: <AdminAddProperty /> },
      { path: 'sub-admin', element: <SubAdminDashboard /> },
      { path: 'superadmin', element: <SuperAdminDashboard /> },
      { path: 'super-admin', element: <Navigate to="/superadmin" replace /> },
      { path: 'edit-property/:id', element: <UserEditProperty /> },
      { path: 'payment/:id', element: <PaymentPage /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
