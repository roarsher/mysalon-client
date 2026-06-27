 
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider }     from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import PrivateRoute         from './components/common/PrivateRoute';
import Navbar               from './components/layout/Navbar';
import NotificationsPage from './pages/NotificationsPage';


import HomePage           from './pages/HomePage';
import LoginPage          from './pages/LoginPage';
import SignupPage         from './pages/SignupPage';
import VerifyEmailPage    from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AboutPage          from './pages/AboutPage';
import ContactPage        from './pages/ContactPage';
import SalonDetailPage    from './pages/SalonDetailPage';
import BookingPage        from './pages/BookingPage';
import QueueStatusPage    from './pages/QueueStatusPage';
import MyBookingsPage     from './pages/MyBookingsPage';
import ProfilePage        from './pages/ProfilePage';
import RatingPage         from './pages/RatingPage';
import OwnerDashboard     from './pages/owner/OwnerDashboard';
import RegisterSalonPage  from './pages/owner/RegisterSalonPage';
import ManageSalonPage    from './pages/owner/ManageSalonPage';
import QueueManagerPage   from './pages/owner/QueueManagerPage';

export default function App() {
  return (
    <AuthProvider>
      <LocationProvider>          {/* ← provides userLocation globally */}
        <Router>
          <div className="min-h-screen bg-gray-50 pb-16 sm:pb-0">
            <Navbar />
            <Routes>
              {/* Public */}
              <Route path="/"                element={<HomePage />} />
              <Route path="/about"           element={<AboutPage />} />
              <Route path="/contact"         element={<ContactPage />} />
              <Route path="/salon/:id"       element={<SalonDetailPage />} />
              <Route path="/login"           element={<LoginPage />} />
              <Route path="/signup"          element={<SignupPage />} />
              <Route path="/verify-email"    element={<VerifyEmailPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Private — customers */}
               
              <Route path="/notifications" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />
              <Route path="/booking/:salonId" element={<PrivateRoute><BookingPage /></PrivateRoute>} />
              <Route path="/queue/:bookingId" element={<PrivateRoute><QueueStatusPage /></PrivateRoute>} />
              <Route path="/my-bookings"      element={<PrivateRoute><MyBookingsPage /></PrivateRoute>} />
              <Route path="/profile"          element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
              <Route path="/rate/:bookingId"  element={<PrivateRoute><RatingPage /></PrivateRoute>} />

              {/* Private — salon owners */}
              <Route path="/owner/dashboard"      element={<PrivateRoute><OwnerDashboard /></PrivateRoute>} />
              <Route path="/owner/register-salon" element={<PrivateRoute><RegisterSalonPage /></PrivateRoute>} />
              <Route path="/owner/salon/:id"      element={<PrivateRoute><ManageSalonPage /></PrivateRoute>} />
              <Route path="/owner/queue/:salonId" element={<PrivateRoute><QueueManagerPage /></PrivateRoute>} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>

          <ToastContainer position="top-right" autoClose={3500} newestOnTop closeOnClick pauseOnHover theme="light" />
        </Router>
      </LocationProvider>
    </AuthProvider>
  );
}