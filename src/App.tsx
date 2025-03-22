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
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="app-content">
      {user && (
        <nav className="app-nav">
          <Link to="/" className={`nav-tab ${location.pathname === '/' ? 'active' : ''}`}>
            Flight Search
          </Link>
          <Link to="/profile" className={`nav-tab ${location.pathname === '/profile' ? 'active' : ''}`}>
            My Profile
          </Link>
        </nav>
      )}

      <div className="tab-content">
        <Routes>
          <Route path="/login" element={<Auth />} />
          
          <Route path="/" element={
            // <ProtectedRoute>
              <FlightSearch />
            // </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />
          
          <Route path="/booking-details" element={
            // <ProtectedRoute>
              <BookingDetails />
            // </ProtectedRoute>
          } />
          
          <Route path="/booking-confirmation" element={
            <ProtectedRoute>
              <BookingConfirmation />
            </ProtectedRoute>
          } />
          
          <Route path="/booking/confirmation" element={
            <ProtectedRoute>
              <BookingConfirmation />
            </ProtectedRoute>
          } />
          
          <Route path="/booking/:id" element={
            <ProtectedRoute>
              <BookingConfirmation />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
};

// Main App component wrapped with AuthProvider and Router
const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <header className="app-header">
            <div className="logo">
              <Link to="/">
                <h1>SkyJourney</h1>
              </Link>
            </div>
          </header>
          
          <main className="app-main">
            <MainContent />
          </main>
          
          <footer className="app-footer">
            <p>&copy; {new Date().getFullYear()} SkyJourney. All rights reserved.</p>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
