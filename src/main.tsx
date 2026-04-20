import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate, Link } from 'react-router';
import { motion } from 'motion/react';
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
import PrivacyPolicy from './app/pages/PrivacyPolicy';
import Terms from './app/pages/Terms';
import { Home as HomeIcon, ArrowRight, Building2 } from 'lucide-react';
import './styles/globals.css';

function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6f2f5] via-white to-[#e6f2f5] flex items-center justify-center px-4 pt-20" dir="rtl">
      <div className="text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="relative inline-block">
            <span className="text-[10rem] font-black text-[#005a7d]/10 leading-none">404</span>
            <div className="absolute inset-0 flex items-center justify-center">
              <Building2 size={48} className="text-[#bca056]" />
            </div>
          </div>
        </motion.div>
        
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-black text-gray-900 mb-4"
        >
          الصفحة غير موجودة
        </motion.h1>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600 mb-8 text-lg"
        >
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها
        </motion.p>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex gap-4 justify-center"
        >
          <Link 
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#005a7d] text-white rounded-xl font-semibold hover:bg-[#004a68] transition-all"
          >
            <HomeIcon size={18} />
            الرئيسية
          </Link>
          <Link 
            to="/properties"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#bca056] text-white rounded-xl font-semibold hover:bg-[#a68a47] transition-all"
          >
            <Building2 size={18} />
            العقارات
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

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
      { path: 'my-properties', element: <UserDashboard /> },
      { path: 'saved', element: <SavedProperties /> },
      { path: 'profile', element: <UserDashboard /> },
      { path: 'my-profile', element: <UserDashboard /> },
      { path: 'account', element: <UserDashboard /> },
      { path: 'admin', element: <AdminDashboard /> },
      { path: 'admin/contact', element: <AdminDashboard /> },
      { path: 'admin/add-property', element: <AdminAddProperty /> },
      { path: 'admin/notifications', element: <AdminDashboard /> },
      { path: 'admin/properties', element: <AdminDashboard /> },
      { path: 'sub-admin', element: <SubAdminDashboard /> },
      { path: 'subadmin', element: <SubAdminDashboard /> },
      { path: 'superadmin', element: <SuperAdminDashboard /> },
      { path: 'super-admin', element: <Navigate to="/superadmin" replace /> },
      { path: 'edit-property/:id', element: <UserEditProperty /> },
      { path: 'payment/:id', element: <PaymentPage /> },
      { path: 'privacy', element: <PrivacyPolicy /> },
      { path: 'terms', element: <Terms /> },
    ],
    errorElement: <NotFound />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);