import type React from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { Navigate, useLocation } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { useEffect } from "react";
import { setUser } from "../store/slices/authSlice";

const ProtectedRoute: React.FC= ()=> {
    const { isAuthenticated , user} = useAppSelector(state => state.auth);
    const location = useLocation();
    const dispatch = useAppDispatch();
    useEffect(() => {
        const saveUserId = localStorage.getItem('spreadsheet_current_user');
        const savedUserName = localStorage.getItem('spreadsheet_current_user_name');
        if(saveUserId && !user) {
            dispatch(setUser({
                id: saveUserId,
                name: savedUserName || 'Пользователь',
                email: ''
            }));
        }
    }, [dispatch,user]);
    if (!isAuthenticated && !localStorage.getItem('spreadsheet_current_user')) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return <Outlet />;
};
export default ProtectedRoute;