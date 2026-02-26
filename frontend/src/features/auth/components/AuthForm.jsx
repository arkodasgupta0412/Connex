import { useState } from 'react';

import SettingsButton from '../../../components/settings/SettingsButton/SettingsButton';
import SettingsSidebar from '../../../components/settings/SettingsSidebar/SettingsSidebar';
import authService from '../../../services/authService'
import './AuthForm.css';



const AuthForm = ({ onLoginSuccess, theme, onThemeChange }) => {
  const [mode, setMode] = useState('login'); 
  const [settingsSidebarOpen, setSettingsSidebarOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    securityAnswer: '',
    profileName: ''
  });
  
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState({ text: '', type: '' });

  const switchMode = (newMode) => {
    setMode(newMode);
    setFormData({
      username: '', 
      password: '',
      confirmPassword: '',
      securityAnswer: '',
      profileName: ''
    });
    setErrors({});
    setServerMessage({ text: '', type: '' });
  };

  const handleChange = (event) => {
    const { id, value } = event.target;
    setFormData({ ...formData, [id]: value });
    

    if (errors[id]) {
      setErrors({ ...errors, [id]: '' });
    }
    
    if (serverMessage.text) {
      setServerMessage({ text: '', type: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const { username, password, confirmPassword, securityAnswer, profileName } = formData;

    if (!username) {
      newErrors.username = "Username is required";
    }

    if (mode === 'login' && !password) {
      newErrors.password = "Password is required";
    }

    if (mode === 'signup') {
      if (!password) {
        newErrors.password = "Password is required";
      }

      if (password && !confirmPassword) {
        newErrors.confirmPassword = "Confirm password";
      } 
      else if (password && confirmPassword && password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }

      if (!securityAnswer) {
        newErrors.securityAnswer = "Security answer required";
      }

      if (!profileName) {
        newErrors.profileName = "Profile name required";
      }

      if (username == profileName) {
        newErrors.profileName = "Profile name cannot be the same as username";
      }
    }

    if (mode === 'reset') {
      if (!password) {
        newErrors.password = "New password required";
      }

      if (password && !confirmPassword) {
        newErrors.confirmPassword = "Confirm new password";
      } else if (password && confirmPassword && password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }

      if (!securityAnswer) {
        newErrors.securityAnswer = "Security answer required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuth = async (e) => {
    if (e) 
      e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      let data;

      if (mode === 'signup') {
        data = await authService.signup(formData);
      } else if (mode === 'login') {
        data = await authService.login(formData);
      }
      else if (mode === 'reset') {
        data = await authService.resetPassword(formData);
      }

      if (data.success) {
        setServerMessage({ text: data.message, type: 'success' });
        setErrors({});
        
        if (mode === 'login' || mode === 'signup') {
            setTimeout(() => onLoginSuccess(formData.username), 1000);
        } else {
            setTimeout(() => switchMode('login'), 1500);
        }
      } else {
        setServerMessage({ text: data.message, type: 'error' });
        setErrors({});
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Server Error. Is the backend running?";
      setServerMessage({ text: errorMessage, type: 'error' });
      setErrors({});
    }
  };

  return (
    <div className="auth-page">
        {/* SETTINGS BUTTON */}
        <SettingsButton 
            onClick={() => setSettingsSidebarOpen(true)} 
        />

        <form className="auth-box" onSubmit={handleAuth}>
            <h2 className="auth-title">
                {mode === 'login' ? 'Welcome Back,' : mode === 'signup' ? 'Sign Up' : 'Reset Password'}
            </h2>

            {/* Username */}
            <div className="form-field">
                <input 
                    id="username" 
                    placeholder="Username" 
                    value={formData.username} 
                    onChange={handleChange} 
                    className="auth-input"
                />
                {errors.username && (<span className="field-error">{errors.username} !</span>)}
            </div>
            
            {/* Password */}
            <div className="form-field">
                <input 
                    id="password" 
                    type="password" 
                    placeholder={mode === 'reset' ? "New Password" : "Password"} 
                    value={formData.password} 
                    onChange={handleChange} 
                    className="auth-input"
                />
                {errors.password && (<span className="field-error">{errors.password} !</span>)}
            </div>

            {/* FORGOT PASSWORD LINK */}
            {mode === 'login' && (
                <div style={{ textAlign: 'right', marginTop: '-10px', marginBottom: '20px'}}>
                    <span
                        onClick={() => switchMode('reset')} 
                        className="link-text auth-footer"
                    >
                        Forgot Password?
                    </span>
                </div>
            )}

            {/* SERVER ERROR MESSAGE FOR LOGIN */}
            {mode === 'login' && serverMessage.text && serverMessage.type === 'error' && (
                <div className="auth-server-error">
                    {serverMessage.text}
                </div>
            )}

            {/* Confirm Password */}
            {(mode === 'signup' || mode === 'reset') && (
                <div className="form-field">
                    <input 
                        id="confirmPassword" 
                        type="password" 
                        placeholder={mode === 'reset' ? 'Confirm New Password' : 'Confirm Password'} 
                        value={formData.confirmPassword} 
                        onChange={handleChange} 
                        className="auth-input"
                    />
                    {errors.confirmPassword && (
                        <span className="field-error">{errors.confirmPassword} !</span>
                    )}
                </div>
            )}

            {/* Security Answer */}
            {(mode === 'signup' || mode === 'reset') && (
                <div className="form-field">
                    <input 
                        id="securityAnswer" 
                        placeholder={mode === 'reset' ? "Security Answer" : "Security Answer (e.g., Pet Name)"}  
                        value={formData.securityAnswer} 
                        onChange={handleChange} 
                        className="auth-input"
                    />
                    {errors.securityAnswer && (
                        <span className="field-error">{errors.securityAnswer} !</span>
                    )}
                </div>
            )}

            {/* Profile Name */}
            {mode === 'signup' && (
                <div className="form-field">
                    <input 
                        id="profileName" 
                        placeholder="Profile Name (Display Name)" 
                        value={formData.profileName} 
                        onChange={handleChange} 
                        className="auth-input"
                    />
                    {errors.profileName && (
                        <span className="field-error">{errors.profileName} !</span>
                    )}
                </div>
            )}

            {/* SERVER MESSAGE (API RESPONSE) */}
            {serverMessage.text && serverMessage.type === 'success' && (
                <div className="field-success">
                    {serverMessage.text} ✓
                </div>
            )}

            {/* SERVER ERROR MESSAGE FOR SIGNUP/RESET MODES ONLY */}
            {mode !== 'login' && serverMessage.text && serverMessage.type === 'error' && (
                <div className="auth-server-error">
                    {serverMessage.text}
                </div>
            )}

            <button type="submit"
                    onClick={handleAuth} 
                    onKeyDown={(e) => e.key === 'Enter' && handleAuth()} 
                    className="btn-submit"
            >
                {mode === 'login' ? 'SIGN IN' : mode === 'signup' ? 'SIGN UP' : 'RESET PASSWORD'}
            </button>

            <div className="auth-footer">
                {(mode === 'login' || mode === 'reset') ? (
                    <>
                        <span>New here?  </span>
                        <span onClick={() => switchMode('signup')} className="link-text"><u>SIGN UP</u></span>
                    </>
                ) : (
                    <>
                        <span>Already a user?  </span>
                        <span onClick={() => switchMode('login')} className="link-text"><u>LOGIN</u></span>
                    </>
                )}
            </div>
        </form>

        {/* SETTINGS SIDEBAR */}
        <SettingsSidebar 
            isOpen={settingsSidebarOpen}
            onClose={() => setSettingsSidebarOpen(false)}
            theme={theme}
            onThemeChange={onThemeChange}
        />
    </div>
  );
};

export default AuthForm;