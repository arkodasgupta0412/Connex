import { useState, useEffect } from 'react';

import AuthForm from '../features/auth/components/AuthForm'; 
import Dashboard from '../features/dashboard/layout/Layout';
import { AVAILABLE_THEMES } from '../config/themes';
import '../styles/index.css';

function App() {
  const [user, setUser] = useState(localStorage.getItem('chatAppUser') || null);
  const [theme, setTheme] = useState(localStorage.getItem('chatAppTheme') || 'dark');

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('chatAppTheme', newTheme);
  };

  useEffect(() => {
    const themeClasses = AVAILABLE_THEMES.map(t => t.id);
    document.body.classList.remove(...themeClasses);
    document.body.classList.add(theme);

  }, [theme]);

  const handleLogin = (username) => {
      localStorage.setItem('chatAppUser', username);
      setUser(username);
  };

  const handleLogout = () => {
      localStorage.removeItem('chatAppUser');
      setUser(null);
  };

  if (!user) {
    return (
        <AuthForm 
            onLoginSuccess={handleLogin} 
            theme={theme} 
            onThemeChange={handleThemeChange} 
        />
    );
  }

  return (
    <Dashboard 
        user={user} 
        onLogout={handleLogout} 
        theme={theme} 
        onThemeChange={handleThemeChange} 
    />
  );
}

export default App;