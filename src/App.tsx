import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import './App.css';
import FlightSearch from './components/FlightSearch/FlightSearch';
import Auth from './components/Auth/Auth';
import UserProfile from './components/UserProfile/UserProfile';
import BookingDetails from './components/BookingDetails/BookingDetails';
import BookingConfirmation from './components/BookingDetails/BookingConfirmation';
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Main content component with navigation
const MainContent: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  return (
    <>
      <header className="app-header">
        <div className="header-content">
          <Link to="/" className="logo">SkyJourney</Link>
          <nav className="header-nav">
            {user ? (
              <>
                <Link to="/profile" className="profile-button">
                  <i className="fas fa-user"></i>
                  My Profile
                </Link>
                <button onClick={signOut} className="auth-button login-button">
                  Sign Out
                </button>
              </>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="auth-button login-button">Login</Link>
                <Link to="/signup" className="auth-button signup-button">Sign Up</Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      <div className="app-content">
        <Routes>
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<Auth isSignUp />} />

          <Route path="/booking-details" element={<BookingDetails />} />
          
          <Route path="/" element={<FlightSearch />} />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />
          
          <Route path="/booking/:id" element={
            <ProtectedRoute>
              <BookingDetails />
            </ProtectedRoute>
          } />
          
          <Route path="/booking/confirmation" element={
            <ProtectedRoute>
              <BookingConfirmation />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </>
  );
};

// Main App component wrapped with AuthProvider and Router
const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <MainContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
