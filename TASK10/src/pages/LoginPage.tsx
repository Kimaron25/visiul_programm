import type React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { useEffect, useState } from "react";
import { clearError, loginThunk } from "../store/slices/authSlice";

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch  = useAppDispatch();
    const { loading , error , isAuthenticated } = useAppSelector(state => state.auth);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [localError, setLocalError] =  useState('');
    useEffect(() => {
        if(isAuthenticated) {
            const from = (location.state as any)?.from?.pathname || '/dashboard';
            navigate(from, { replace: true});
        }
    }, [isAuthenticated, navigate, location]);
    
    useEffect(() => {
        dispatch(clearError());
        setLocalError('');
    }, [email,password,dispatch]);
    
    const validateForm  = (): boolean => {
        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            setLocalError('Введите корректный email');
            return false;
        }
        if(password.length < 8) {
            setLocalError('Пароль должен содержать минимум 8 символов');
            return false;
        }
        return true;
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!validateForm()) return;
        try {
            await dispatch(loginThunk({email,password})).unwrap();
        } catch(err) {

        }
    };
    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>Вход</h1>
                <form onSubmit={handleSubmit}>
                    <div className="auth-field">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@mail.com"
                            disabled={loading}
                        />
                    </div>
                    
                    <div className="auth-field">
                        <label>Пароль</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Минимум 8 символов"
                            disabled={loading}
                        />
                    </div>
                    
                    {(localError || error) && (
                        <div className="auth-error">{localError || error}</div>
                    )}
                    
                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Вход...' : 'Войти'}
                    </button>
                </form>
                
                <div className="auth-footer">
                    Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;