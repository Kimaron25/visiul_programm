import type React from "react";
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import './AppLayout.css';
import { logoutThunk } from "../../store/slices/authSlice";

const AppLayout: React.FC = () => {
    const { user } = useAppSelector(state=>state.auth);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const handleLogout = async () => {
        await dispatch(logoutThunk());
        navigate('/login');
    };
    return (
        <div className="app-layout">
            <header className="app-layout-header">
                <div className="logo">
                    <Link to="/dashboard">Табличный процессор</Link>
                </div>
                <div className="user-info">
                    {user && (
                        <>
                            <span>{user.name}</span>
                            <Link to="/profile" className="profile-link">Профиль</Link>
                            <button onClick={handleLogout} className="logout-btn">
                                |Выйти|
                            </button>
                        </>
                    )}
                </div>
            </header>
            <main className="app-layout-main">
                <Outlet />
            </main>
        </div>
    );
};
export default AppLayout;
