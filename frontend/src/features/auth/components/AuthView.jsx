// frontend/src/features/auth/AuthView.jsx
import './AuthForm.css';

const AuthView = ({ 
    mode, 
    formData, 
    message, 
    handleChange, 
    handleAuth, 
    setMode, 
    setMessage 
}) => {
    
    return (
        <div className="auth-container">
            <h2 className="auth-title">
                {mode === 'login' ? 'Login' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
            </h2>

            <div className="form-group">
                <input 
                    id="username" 
                    className="auth-input"
                    placeholder="Username" 
                    onChange={handleChange} 
                    value={formData.username} 
                />
                <input 
                    id="password" 
                    type="password" 
                    className="auth-input"
                    placeholder={mode === 'reset' ? "New Password" : "Password"} 
                    onChange={handleChange} 
                    value={formData.password} 
                />

                {(mode === 'signup' || mode === 'reset') && (
                    <>
                        <input 
                            id="confirmPassword" 
                            type="password" 
                            className="auth-input"
                            placeholder="Confirm Password" 
                            onChange={handleChange} 
                            value={formData.confirmPassword} 
                        />
                        <input 
                            id="securityAnswer" 
                            className="auth-input"
                            placeholder="Security Answer" 
                            onChange={handleChange} 
                            value={formData.securityAnswer} 
                        />
                    </>
                )}

                <button onClick={handleAuth} className="auth-button">
                    {mode === 'login' ? 'Login' : mode === 'signup' ? 'Sign Up' : 'Set New Password'}
                </button>
            </div>

            <div className="auth-message" style={{ color: message.color }}>
                {message.text}
            </div>

            <div className="toggle-text">
                {mode === 'login' ? (
                    <>
                        New here? <span className="toggle-link" onClick={() => {setMode('signup'); setMessage({text:'', color:''})}}>Sign Up</span>
                        <br/><br/>
                        <span className="toggle-link" onClick={() => {setMode('reset'); setMessage({text:'', color:''})}}>Forgot Password?</span>
                    </>
                ) : (
                    <span className="toggle-link" onClick={() => {setMode('login'); setMessage({text:'', color:''})}}>Back to Login</span>
                )}
            </div>
        </div>
    );
};

export default AuthView;