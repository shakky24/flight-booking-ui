import React, { useState } from 'react';
import { api } from '../../services/api';
import './Auth.css';

interface LoginProps {
  onToggleForm: () => void;
}

const Login: React.FC<LoginProps> = ({ onToggleForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error, data } = await api.signIn(email, password);
      if (error) {
        setError(error.message || error);
      } else if (data) {
        // Store authentication session in localStorage
        localStorage.setItem('auth_session', JSON.stringify({
          accessToken: data.accessToken,
          user: data.user
        }));
        
        // Redirect to home or dashboard
        window.location.href = '/';
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Login to Your Account</h2>
      <p className="auth-subtitle">Access your bookings and manage your profile</p>
      
      {error && <div className="auth-error">{error}</div>}
      
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />
        </div>
        
        <button 
          type="submit" 
          className="auth-button" 
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <div className="auth-alt-action">
        Don't have an account?{' '}
        <button 
          onClick={onToggleForm} 
          className="auth-text-button"
        >
          Sign up
        </button>
      </div>
    </div>
  );
};

export default Login;
