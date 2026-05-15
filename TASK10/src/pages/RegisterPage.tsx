import type React from 'react';
import './AuthPage.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { clearError, registerThunk } from '../store/slices/authSlice';

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { loading , error , isAuthenticated} = useAppSelector(state => state.auth);
    const [name , setName] = useState('');
    const [email , setEmail] = useState('');
    const [password , setPassword] = useState('');
    const [confirmPassword , setConfirmPassword] = useState('');
    const [localError , setLocalError] = useState('');
    useEffect(() => {
        if(isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    },[isAuthenticated, navigate]);
    useEffect(() => {
        dispatch(clearError());
        setLocalError('');
    }, [name,email, password, confirmPassword, dispatch]);

    const validateForm = () : boolean => {
        if(!name.trim()) {
            setLocalError('Введите имя');
            return false;
        }
        if(!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            setLocalError('Введите корректный email');
        }
        if(password.length < 8) {
            setLocalError('Пароль должен содержать минимум 8 символов');
            return false;
        }
        if(password!== confirmPassword) {
            setLocalError('Пароли не совпадают');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!validateForm()) return;
        try {
            await dispatch(registerThunk( { name, email, password})).unwrap();
        } catch (err) {

        }
    };
    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>Регистрация</h1>
                <form onSubmit={handleSubmit}>
                    <div className="auth-field">
                        <label>Имя</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ваше имя"
                            disabled={loading}
                        />
                    </div>
                    
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
                    
                    <div className="auth-field">
                        <label>Подтверждение пароля</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Повторите пароль"
                            disabled={loading}
                        />
                    </div>
                    
                    {(localError || error) && (
                        <div className="auth-error">{localError || error}</div>
                    )}
                    
                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                    </button>
                </form>
                
                <div className="auth-footer">
                    Уже есть аккаунт? <Link to="/login">Войти</Link>
                </div>
            </div>
        </div>
    );
}
export default RegisterPage;