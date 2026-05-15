import type React from "react";
import { useAppSelector } from "../store/hooks";
import Breadcrumbs from '../components/Layout/Breadcrumbs';
import './ProfilePage.css'

const ProfilePage: React.FC =() => {
    const { user} = useAppSelector(state => state.auth);
    return (
        <div className="profile-page">
            <Breadcrumbs />
            <div className="profile-card">
                <h2>Профиль пользователя</h2>
                <div className="profile-info">
                    <div className="profile-field">
                        <label>Имя:</label>
                        <span>{user?.name || 'Не указано'}</span>
                    </div>
                    <div className="profile-field">
                        <label>Email:</label>
                        <span>{user?.email || 'Не указан'}</span>
                    </div>
                    <div className="profile-field">
                        <label>ID пользователя:</label>
                        <span>{user?.id || '—'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ProfilePage;