import type React from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import Breadcrumbs from '../components/Layout/Breadcrumbs';
import './ProfilePage.css'
import { useNavigate } from "react-router-dom";
import { use, useEffect, useState } from "react";
import { logoutThunk, updatePassword, updateUserName } from "../store/slices/authSlice";
import { loadDocuments } from "../store/slices/documentsSlice";

const ProfilePage: React.FC =() => {
    const { user} = useAppSelector(state => state.auth);
    const { list: documents} = useAppSelector(state => state.documents);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState(user?.name || '');
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        dispatch(loadDocuments());
    }, [dispatch]);
    const handleUpdateName = async () => {
        if(!newName.trim()) return;
        try {
            await dispatch(updateUserName(newName)).unwrap();
            setIsEditingName(false);
            setSuccess('Имя обновлено');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.message || 'Ошибка обновления имени');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleChangePassword = async () => {
        if(newPassword !== confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }
        if( newPassword.length < 8) {
            setError('Пароль должен быть минимум 8 символов');
            return;
        }
        if(!oldPassword) {
            setError('Введите старый пароль');
            return;
        }
        try {
            await dispatch(updatePassword({oldPassword,newPassword})).unwrap();
            setIsChangingPassword(false);
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setError('');
            setSuccess('Пароль успешно изменён');
            setTimeout(() => setSuccess(''), 3000);
        } catch ( err: any) {
            setError(err.message || 'Ошибка смены пароля');
        }
    };

    const handleLogout = async () => {
        await dispatch(logoutThunk());
        navigate('/login');
    };


    return (
        <div className="profile-page">
            <Breadcrumbs />
            <div className="profile-card">
                <h2>Профиль пользователя</h2>
                {success && <div className="success-message">{success}</div>}
                {error && <div className="error-message">{error}</div>}
                <div className="profile-info">
                    <div className="profile-field">
                        <label>Имя:</label>
                        {isEditingName ? (
                            <div className="edit-field">
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    onBlur={handleUpdateName}
                                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateName()}
                                    autoFocus
                                />
                            </div>
                        ) : (
                            <div className="field-value">
                                <span>{user?.name || 'Не указано'}</span>
                                <button onClick={() => setIsEditingName(true)} className="edit-btn">
                                    |*|
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="profile-field">
                        <label>Email:</label>
                        <span>{user?.email || 'Не указан'}</span>
                    </div>
                </div>
                <div className="profile-section">
                    <h3>Статистика</h3>
                    <div className="profile-field">
                        <label>Количество документов:</label>
                        <span>{documents.length}</span>
                    </div>
                </div>

                <div className="profile-section">
                    <h3>Информация об аккаунте</h3>
                    <div className="profile-field">
                        <label>Дата регистрации:</label>
                        <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ru-RU') : '—'}</span>
                    </div>
                </div>
                
                <div className="profile-section">
                    <h3>Безопасность</h3>
                    {isChangingPassword ? (
                        <div className="password-form">
                            <input
                                type="password"
                                placeholder="Старый пароль"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                            />
                            <input
                                type="password"
                                placeholder="Новый пароль (мин. 8 символов)"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <input
                                type="password"
                                placeholder="Подтвердите пароль"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <div className="password-actions">
                                <button onClick={handleChangePassword} className="save-btn">
                                    Сохранить
                                </button>
                                <button onClick={() => setIsChangingPassword(false)} className="cancel-btn">
                                    Отмена
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => setIsChangingPassword(true)} className="change-password-btn">
                            Сменить пароль
                        </button>
                    )}
                </div>
                
                <div className="profile-section">
                    <button onClick={handleLogout} className="logout-btn">
                        Выйти из аккаунта
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;