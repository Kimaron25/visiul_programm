import type React from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../store/hooks";
import { useCallback } from "react";
import { setCreateModalOpen } from "../store/slices/uiSlice";
import Dashboard from '../components/Dashboard/Dashboard';

const DashboardPage: React.FC = ()=> {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const handleSelectDocument = useCallback((id: string) => {
        navigate(`/documents/${id}`);
    }, [navigate]);

    const handleCreateNew = useCallback(() => {
        dispatch(setCreateModalOpen(true));
    },[dispatch]);
    return (
        <div className="dashboard-page">
            <Dashboard 
                onSelectDocument={handleSelectDocument}
                onCreateNew={handleCreateNew}
            />
        </div>
    );
};
export default DashboardPage;