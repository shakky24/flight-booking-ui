/// <reference types="react-scripts" />

interface ProcessEnv {
  NODE_ENV: 'development' | 'production' | 'test';
  PUBLIC_URL: string;
  REACT_APP_API_URL: string;
}
