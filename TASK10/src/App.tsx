import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/Layout/AppLayout';
import ProtectedRoute from './router/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import SpreadsheetPage from './pages/SpreadsheetPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import CreateDocumentModal from './components/Modals/CreateDocumentModal';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { useNavigate } from 'react-router-dom';

import { setCreateModalOpen } from './store/slices/uiSlice';
import { createNewDocument } from './store/slices/documentsSlice';
import { 
    setData, 
    setRows, 
    setCols
} from './store/slices/spreadsheetSlice';
import { setupAxiosInterceptors } from './services/authService';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { useEffect } from 'react';
import {setNotification } from './store/slices/uiSlice';

setupAxiosInterceptors();
function AppContent() {
 const dispatch = useAppDispatch();
 const navigate = useNavigate();
 const { isCreateModalOpen, notification  } = useAppSelector(state=> state.ui);
 const { isAuthenticated } = useAppSelector(state => state.auth);
 useEffect(() => {
  if (notification) {
    alert(notification);
    dispatch(setNotification(null));
  }
 }, [notification, dispatch]);
 const handleCreateDocument = async (name: string, rows: number, cols: number) =>{
  try {
    if(!isAuthenticated) {
      navigate('/login');
      return;
    }
    const result = await dispatch(createNewDocument({name,rows,cols})).unwrap();
      dispatch(setRows(rows));
      dispatch(setCols(cols));
      dispatch(setData({}));
      dispatch(setCreateModalOpen(false));
      navigate(`/documents/${result.id}`);
  } catch (error) {
    console.error('Ошибка создания документа:', error);
  }
 };
  return (
      <>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/documents/:documentId" element={<SpreadsheetPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <CreateDocumentModal
          isOpen={isCreateModalOpen}
          onClose={() => dispatch(setCreateModalOpen(false))}
          onCreate={handleCreateDocument}
        />
      </>
  );
}

function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}

export default App
