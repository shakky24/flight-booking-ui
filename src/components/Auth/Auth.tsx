import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';
import './Auth.css';

interface AuthProps {
  isSignUp?: boolean;
}

const Auth: React.FC<AuthProps> = ({ isSignUp = false }) => {
  const [isLogin, setIsLogin] = useState(!isSignUp);

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="auth-container">
      <div className="auth-tabs">
        <button
          className={`auth-tab ${isLogin ? 'active' : ''}`}
          onClick={() => setIsLogin(true)}
        >
          Login
        </button>
        <button
          className={`auth-tab ${!isLogin ? 'active' : ''}`}
          onClick={() => setIsLogin(false)}
        >
          Sign Up
        </button>
      </div>
      <div className="auth-content">
        {isLogin ? (
          <Login onToggleForm={toggleForm} />
        ) : (
          <Register onToggleForm={toggleForm} />
        )}
      </div>
    </div>
  );
};

export default Auth;
